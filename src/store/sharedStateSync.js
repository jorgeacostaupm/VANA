const DB_NAME = "vana_shared_state";
const DB_VERSION = 1;
const DB_STORE_NAME = "snapshots";
const SNAPSHOT_ID = "root";

const CHANNEL_NAME = "vana_shared_state_channel";
const STORAGE_SIGNAL_KEY = "__vana_shared_state_signal__";
const PERSIST_DEBOUNCE_MS = 1500;

const SHARED_SLICES = [
  "cantab",
  "compare",
  "correlation",
  "evolution",
  "metadata",
  "dataframe",
];

export const HYDRATE_SHARED_STATE = "sharedState/hydrate";

let dbPromise = null;

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.indexedDB !== "undefined";

const toRevision = (value) => {
  const revision = Number(value);
  return Number.isFinite(revision) && revision > 0 ? Math.floor(revision) : 0;
};

const buildTabId = () => {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getSharedState = (state) => {
  const snapshot = {};
  SHARED_SLICES.forEach((sliceKey) => {
    if (state && sliceKey in state) {
      snapshot[sliceKey] = state[sliceKey];
    }
  });
  return snapshot;
};

const getSliceRefs = (state) => {
  const refs = {};
  SHARED_SLICES.forEach((sliceKey) => {
    refs[sliceKey] = state ? state[sliceKey] : undefined;
  });
  return refs;
};

const hasSharedStateChanges = (previousRefs, nextState) => {
  if (!nextState) return false;
  return SHARED_SLICES.some(
    (sliceKey) => previousRefs[sliceKey] !== nextState[sliceKey],
  );
};

const openDatabase = () => {
  if (!isBrowser()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
        db.createObjectStore(DB_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    dbPromise = null;
    throw error;
  });

  return dbPromise;
};

const readSnapshot = async () => {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, "readonly");
    const store = tx.objectStore(DB_STORE_NAME);
    const request = store.get(SNAPSHOT_ID);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

const writeSnapshot = async ({ revision, state }) => {
  const db = await openDatabase();
  if (!db) return;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE_NAME, "readwrite");
    const store = tx.objectStore(DB_STORE_NAME);

    const request = store.put({
      id: SNAPSHOT_ID,
      revision,
      updatedAt: Date.now(),
      state,
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const initializeSharedStateSync = async (store) => {
  if (!store || !isBrowser()) return;

  const tabId = buildTabId();
  let revision = 0;
  let isApplyingRemoteSnapshot = false;
  let persistTimer = null;
  let queuedRemoteSync = Promise.resolve();
  let lastSliceRefs = getSliceRefs(store.getState());

  const channel =
    typeof window.BroadcastChannel === "function"
      ? new window.BroadcastChannel(CHANNEL_NAME)
      : null;

  const signalPeers = (nextRevision) => {
    const signal = { sender: tabId, revision: nextRevision, ts: Date.now() };

    if (channel) {
      channel.postMessage(signal);
    }

    if (typeof window.localStorage !== "undefined") {
      window.localStorage.setItem(STORAGE_SIGNAL_KEY, JSON.stringify(signal));
    }
  };

  const applySnapshot = async (snapshot) => {
    const incomingRevision = Math.max(
      toRevision(snapshot?.revision),
      snapshot?.state ? 1 : 0,
    );
    if (!snapshot?.state || incomingRevision <= revision) return;

    isApplyingRemoteSnapshot = true;
    try {
      store.dispatch({
        type: HYDRATE_SHARED_STATE,
        payload: snapshot.state,
      });
      revision = incomingRevision;
      lastSliceRefs = getSliceRefs(store.getState());
    } finally {
      isApplyingRemoteSnapshot = false;
    }
  };

  const syncFromIndexedDb = async (incomingRevision) => {
    if (incomingRevision <= revision) return;

    const snapshot = await readSnapshot();
    if (!snapshot) return;
    await applySnapshot(snapshot);
  };

  const queueRemoteSync = (incomingRevision) => {
    queuedRemoteSync = queuedRemoteSync
      .then(() => syncFromIndexedDb(incomingRevision))
      .catch((error) => {
        console.error("Shared state remote sync failed:", error);
      });
  };

  try {
    const snapshot = await readSnapshot();
    if (snapshot?.state) {
      await applySnapshot(snapshot);
    }
  } catch (error) {
    console.error("Shared state initial hydration failed:", error);
  }

  lastSliceRefs = getSliceRefs(store.getState());

  const persistState = async () => {
    const state = store.getState();
    const nextRevision = revision + 1;
    await writeSnapshot({
      revision: nextRevision,
      state: getSharedState(state),
    });
    revision = nextRevision;
    signalPeers(nextRevision);
  };

  const schedulePersist = () => {
    if (persistTimer) {
      window.clearTimeout(persistTimer);
    }

    persistTimer = window.setTimeout(() => {
      persistTimer = null;
      persistState().catch((error) => {
        console.error("Shared state persistence failed:", error);
      });
    }, PERSIST_DEBOUNCE_MS);
  };

  store.subscribe(() => {
    const currentState = store.getState();
    const stateChanged = hasSharedStateChanges(lastSliceRefs, currentState);
    if (!stateChanged) return;

    lastSliceRefs = getSliceRefs(currentState);
    if (isApplyingRemoteSnapshot) return;
    schedulePersist();
  });

  const handleIncomingSignal = (signal) => {
    if (!signal || signal.sender === tabId) return;
    const incomingRevision = toRevision(signal.revision);
    if (incomingRevision <= revision) return;
    queueRemoteSync(incomingRevision);
  };

  if (channel) {
    channel.addEventListener("message", (event) =>
      handleIncomingSignal(event.data),
    );
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_SIGNAL_KEY || !event.newValue) return;
    try {
      handleIncomingSignal(JSON.parse(event.newValue));
    } catch {
      // ignore malformed payloads from third-party scripts.
    }
  });
};
