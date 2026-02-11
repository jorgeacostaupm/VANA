import cantabReducer from "./slices/cantabSlice";
import compareReducer from "./slices/compareSlice";
import evolutionReducer from "./slices/evolutionSlice";
import correlationReducer from "./slices/correlationSlice";
import dataReducer from "./slices/dataSlice";
import metaReducer from "./slices/metaSlice";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  HYDRATE_SHARED_STATE,
  initializeSharedStateSync,
} from "./sharedStateSync";

const baseReducer = combineReducers({
  cantab: cantabReducer,
  compare: compareReducer,
  evolution: evolutionReducer,
  correlation: correlationReducer,
  metadata: metaReducer,
  dataframe: dataReducer,
});

const reducer = (state, action) => {
  if (action?.type === HYDRATE_SHARED_STATE) {
    if (!action.payload || typeof action.payload !== "object") return state;
    const currentState = state ?? baseReducer(undefined, { type: "@@INIT" });
    return {
      ...currentState,
      ...action.payload,
    };
  }
  return baseReducer(state, action);
};

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
      immutableStateInvariant: false,
    }),
});

let syncInitializationPromise = null;

export const initializeStoreSync = () => {
  if (!syncInitializationPromise) {
    syncInitializationPromise = initializeSharedStateSync(store);
  }
  return syncInitializationPromise;
};

export default store;
