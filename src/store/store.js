import cantabReducer from "./slices/cantabSlice";
import compareReducer from "./slices/compareSlice";
import evolutionReducer from "./slices/evolutionSlice";
import correlationReducer from "./slices/correlationSlice";
import dataReducer from "./slices/dataSlice";
import metaReducer from "./slices/metaSlice";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  createStateSyncMiddleware,
  withReduxStateSync,
  initStateWithPrevTab,
} from "redux-state-sync";

const root_reducer = combineReducers({
  cantab: cantabReducer,
  compare: compareReducer,
  evolution: evolutionReducer,
  correlation: correlationReducer,
  metadata: metaReducer,
  dataframe: dataReducer,
});

const store = configureStore({
  reducer: withReduxStateSync(root_reducer),
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
      immutableStateInvariant: false,
    }).concat(createStateSyncMiddleware());
    return middlewares;
  },
});

initStateWithPrevTab(store);

export default store;
