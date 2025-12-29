import * as aq from "arquero";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SPECIAL_FUNCTIONS } from "@/components/Hierarchy/menu/logic/formularGenerator";

/* export const generateAggregation = createAsyncThunk(
  "dataframe/agg-generate",
  async ({ colName, formula }, { getState, rejectWithValue }) => {
    try {
      const dt = getState().dataframe.present.dataframe;
      const qt = getState().cantab.present.quarantineData;

      const data =
        dt && dt.length > 0
          ? aq
              .from(dt)
              .derive({ [colName]: formula }, { drop: false })
              .objects()
          : null;

      const quarantineData =
        qt && qt.length > 0
          ? aq
              .from(qt)
              .derive({ [colName]: formula }, { drop: false })
              .objects()
          : null;

      return { data, quarantineData };
    } catch (error) {
      console.error(error);
      return rejectWithValue("Error aggregating values");
    }
  }
); */

function processFormula(table, formula) {
  const aggMatches = [...formula.matchAll(/__AGG__\("(.+?)","(.+?)"\)/g)];
  let formulaProcessed = formula;

  for (const match of aggMatches) {
    const funcName = match[1];
    const col = match[2];

    if (!SPECIAL_FUNCTIONS[funcName]) {
      throw {
        error: "UnknownFunction",
        msg: `Function "${funcName}" is not defined in SPECIAL_FUNCTIONS`,
      };
    }

    const value = SPECIAL_FUNCTIONS[funcName](table, col);
    formulaProcessed = formulaProcessed.replace(
      `__AGG__("${funcName}","${col}")`,
      value
    );
  }

  return eval(formulaProcessed); // Devuelve (r) => ...
}

export const generateAggregation = createAsyncThunk(
  "dataframe/agg-generate",
  async ({ colName, formula }, { getState, rejectWithValue }) => {
    try {
      const dt = getState().dataframe.present.dataframe;
      const qt = getState().cantab.present.quarantineData;

      const table = aq.from(dt || []);

      const aggMatches = [...formula.matchAll(/__AGG__\("(.+?)","(.+?)"\)/g)];

      let formulaProcessed = formula;
      for (const match of aggMatches) {
        const funcName = match[1];
        const col = match[2];

        const value = SPECIAL_FUNCTIONS[funcName](table, col);

        formulaProcessed = formulaProcessed.replace(
          `__AGG__("${funcName}","${col}")`,
          value
        );
      }

      const derivedFn = eval(formulaProcessed); // (r) => r["col"] / 1234 o similar

      const data =
        dt && dt.length > 0
          ? aq
              .from(dt)
              .derive({ [colName]: derivedFn }, { drop: false })
              .objects()
          : null;

      const quarantineData =
        qt && qt.length > 0
          ? aq
              .from(qt)
              .derive({ [colName]: derivedFn }, { drop: false })
              .objects()
          : null;

      return { data, quarantineData };
    } catch (error) {
      console.error(error);
      return rejectWithValue("Error aggregating values");
    }
  }
);

export const generateAggregationBatch = createAsyncThunk(
  "dataframe/agg-generate-batch",
  async ({ cols }, { getState }) => {
    try {
      const formated = {};
      cols.forEach((m) => {
        if (m?.info?.exec) formated[m.name] = m.info.exec;
      });

      const dt = getState().dataframe.present.dataframe;
      const qt = getState().cantab.present.quarantineData;
      const ft = getState().cantab.present.filteredData;

      const data = dt
        ? aq.from(dt).derive(formated, { drop: false }).objects()
        : null;

      const quarantineData = qt
        ? aq.from(qt).derive(formated, { drop: false }).objects()
        : null;

      const filteredData = ft
        ? aq.from(formated).derive(formated, { drop: false }).objects()
        : null;

      return { data, quarantineData, filteredData };
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
