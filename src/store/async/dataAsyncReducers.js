import * as aq from "arquero";
import { createAsyncThunk } from "@reduxjs/toolkit";
import processFormula from "@/utils/processFormula";

export const generateColumn = createAsyncThunk(
  "dataframe/agg-generate",
  async ({ colName, formula }, { getState, rejectWithValue }) => {
    try {
      const dt = getState().dataframe.present.dataframe;
      const qt = getState().cantab.present.quarantineData;

      const table = aq.from(dt || []);

      const derivedFn = processFormula(table, formula);

      console.log("func", derivedFn);

      const data =
        dt && dt.length > 0
          ? table.derive({ [colName]: derivedFn }, { drop: false }).objects()
          : null;

      const quarantineData =
        qt && qt.length > 0
          ? aq
              .from(qt)
              .derive({ [colName]: derivedFn }, { drop: false })
              .objects()
          : null;

      console.log(data);
      return { data, quarantineData };
    } catch (error) {
      console.error(error);
      return rejectWithValue("Error aggregating values");
    }
  }
);

export const generateColumnBatch = createAsyncThunk(
  "dataframe/agg-generate-batch",
  async ({ cols }, { getState, rejectWithValue }) => {
    try {
      const dt = getState().dataframe.present.dataframe;
      const qt = getState().cantab.present.quarantineData;

      const table = aq.from(dt || []);
      console.log(cols, dt);
      const formated = {};

      cols.forEach((col) => {
        if (col?.info?.exec) {
          formated[col.name] = processFormula(table, col.info.exec);
        }

        /* if (!table.columnNames().includes(col.name)) {
          formated[col.name] = () => null;
        } */
      });

      const data =
        dt && dt.length > 0
          ? table.derive(formated, { drop: false }).objects()
          : null;
      const quarantineData =
        qt && qt.length > 0
          ? aq.from(qt).derive(formated, { drop: false }).objects()
          : null;

      console.log("dadadada", data);

      return { data, quarantineData };
    } catch (error) {
      console.error(error);
      return rejectWithValue("Error aggregating batches");
    }
  }
);

export const generateEmpty = createAsyncThunk(
  "dataframe/agg-empty",
  async ({ colName }, { getState, rejectWithValue }) => {
    try {
      const state = getState().dataframe.present;
      const result = aq
        .from(state.dataframe)
        .derive({ [colName]: () => null }, { drop: false })
        .objects();
      return result;
    } catch (error) {
      return rejectWithValue("Empty aggregation failed");
    }
  }
);

export const removeColumn = createAsyncThunk(
  "dataframe/remove-col",
  async ({ colName }, { getState, rejectWithValue }) => {
    try {
      const state = getState().dataframe.present;
      const removed = [colName];
      const result = aq.from(state.dataframe).select(aq.not(removed)).objects();
      return result;
    } catch (error) {
      return rejectWithValue("Failed to remove attribute");
    }
  }
);

export const removeBatch = createAsyncThunk(
  "dataframe/remove-batch",
  async ({ cols }, { getState }) => {
    try {
      const state = getState().dataframe.present;
      const result = aq.from(state.dataframe).select(aq.not(cols)).objects();
      return result;
    } catch (error) {
      return rejectWithValue("Failed to batch remove");
    }
  }
);
