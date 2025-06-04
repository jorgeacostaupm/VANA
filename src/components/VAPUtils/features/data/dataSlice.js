import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { from as loadObjects, loadCSV, addFunction } from "arquero";
import * as XLSX from "xlsx";
import * as aq from "arquero";

import { buildMetaFromVariableTypes } from "../metadata/metaCreatorReducer";
import {
  generateAggregation,
  generateAggregationBatch,
  generateEmpty,
  removeBatch,
  removeColumn,
} from "./modifyReducers";

import { ORDER_VARIABLE } from "@/utils/Constants";

import { updateHierarchy } from "../metadata/metaSlice";

import { generateTree, getVisibleNodes } from "@/utils/functions";

const initialState = {
  filename: null,
  dataframe: null,
  original: null,
  navioColumns: null,
  loadedState: "ready",
  version: -1,
};

export const getVariableTypes = (df) => {
  const rows = df.objects();
  const result = {};
  rows.forEach((obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value === null) {
          continue;
        }
        const type = typeof value;
        const dtype =
          type !== "object" ? type : value instanceof Date ? "date" : "object";
        result[key] = dtype;
      }
    }
  });
  return result;
};

const deriveOperation = (a, o, t, f) => {
  switch (t) {
    case "string":
      return `(r) => string(r[\"${a}\"])`;
    case "number":
      return `(r) => parse_float(r[\"${a}\"])`;
    case "date":
      if (o == "string") {
        return `(r) => parseDate(r[\"${a}\"], \"${f}\")`; // todo add format
      } else if (o == "number") {
        return `(r) => parseUnixDate(r[\"${a}\"])`; // todo add format
      } else {
        return `(r) => r[\"${a}\"]`;
      }
    default:
      return "(r) => null";
  }
};

// function to give variable type to the attributes
function applyTransformations(df, trans) {
  const transformations = {};
  trans.forEach((t) => {
    if (t.original == t.transform) return;
    const op = deriveOperation(t.attribute, t.original, t.transform, t.format);
    transformations[t.attribute] = op;
  });

  return df.derive(transformations);
}

export const updateFromCSV = createAsyncThunk(
  "dataframe/load-csv",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const delimiter = payload.opts.delimiter || ",";
      const decimal = payload.opts.decimal || ".";
      let dt = await loadCSV(payload.fileURL, {
        delimiter: delimiter,
        decimal: decimal,
      });
      dt = applyTransformations(dt, payload.transforms);
      const meta = getVariableTypes(dt);
      dispatch(buildMetaFromVariableTypes(meta));
      return dt;
    } catch (err) {
      return rejectWithValue("Invalid CSV File");
    }
  }
);

// ASUMES THAT THE LOADED HIERARCHY IS CORRECT
export const updateFromJSON = createAsyncThunk(
  "dataframe/load-api",
  async (payload, { dispatch, rejectWithValue, getState }) => {
    try {
      if (payload?.length === 0) {
        throw new Error(`Retrieved data is empty...`);
      }
      let tmp = aq.from(payload);
      console.log(tmp.columnNames(), tmp.columnNames().length);
      const cols = getState().metadata.attributes;

      const hierarchy_cols = cols.map((col) => col.name);
      const data_cols = tmp.columnNames();

      const diff = hierarchy_cols.filter((item) => !data_cols.includes(item));
      let updatedData = tmp;

      diff.map((col) => {
        updatedData = updatedData.derive(
          { [col]: (r) => null },
          { drop: false }
        );
      });

      let formated = {};
      cols.forEach((m) => {
        if (m?.info?.exec) formated[m.name] = m.info.exec;
      });

      const result = tmp.derive(formated, { drop: false });

      return {
        items: result.objects(),
        column_names: dt.columnNames().filter((d) => d !== ORDER_VARIABLE),
      };
    } catch (err) {
      console.error(err);
      return rejectWithValue("Something is wrong with API data");
    }
  }
);

export const updateData = createAsyncThunk(
  "dataframe/load-import",
  async (
    { data, filename, isGenerateHierarchy },
    { dispatch, rejectWithValue }
  ) => {
    try {
      let dt = aq.from(data);

      // 1. generate hierarchy cols
      let meta = getVariableTypes(dt);

      // 2. then add our custom variable
      dt = dt.derive({ [ORDER_VARIABLE]: aq.op.row_number() });

      console.log(meta);
      if (isGenerateHierarchy) {
        dispatch(buildMetaFromVariableTypes(meta));
      }
      return {
        filename: filename,
        items: dt.objects(),
        column_names: dt.columnNames().filter((d) => d !== ORDER_VARIABLE),
        isNewColumns: isGenerateHierarchy,
      };
    } catch (err) {
      return rejectWithValue("Something is wrong with API data");
    }
  }
);

export const updateFromExcel = createAsyncThunk(
  "dataframe/load-excel",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { fileURL, opts, transforms } = payload;
      const response = await fetch(fileURL);
      const data = await response.arrayBuffer();

      const workbook = XLSX.read(data, { type: "buffer" });
      const worksheet = workbook.Sheets[opts.sheetname];
      let dt = loadObjects(XLSX.utils.sheet_to_json(worksheet));
      dt = applyTransformations(dt, transforms);

      const meta = getVariableTypes(dt);
      dispatch(buildMetaFromVariableTypes(meta));
      return dt;
    } catch (err) {
      return rejectWithValue("Invalid Excel File");
    }
  }
);

export const dataSlice = createSlice({
  name: "dataframe",
  initialState: initialState,
  reducers: (create) => ({
    renameColumn: create.reducer((state, action) => {
      const { prevName, newName } = action.payload;
      state.dataframe = aq
        .from(state.dataframe)
        .rename({ [prevName]: newName })
        .objects();

      const navColIdx = state.navioColumns.findIndex((n) => n === prevName);
      state.navioColumns[navColIdx] = newName;

      state.version += 1;
    }),
    setNavioColumns: create.reducer((state, action) => {
      state.navioColumns = action.payload;
    }),
    setDataframe: create.reducer((state, action) => {
      state.dataframe = action.payload;
      state.version += 1;
    }),
  }),
  extraReducers: (builder) => {
    builder.addCase(updateHierarchy.fulfilled, (state, action) => {
      const { hierarchy } = action.payload;
      const tree = generateTree(hierarchy, 0);
      const filtered = getVisibleNodes(tree);
      state.navioColumns = filtered;
    }),
      builder.addCase(updateData.pending, (state, action) => {
        state.loadedState = "loading";
      }),
      builder.addCase(updateData.fulfilled, (state, action) => {
        state.loadedState = "done";
        console.log(action.payload);
        state.filename = action.payload.filename;
        state.dataframe = action.payload.items;
        if (action.payload.isNewColumns) {
          state.navioColumns = action.payload.column_names;
          state.original = action.payload.column_names;
        }

        state.version += 1;
      }),
      builder.addCase(updateData.rejected, (state, action) => {
        state.loadedState = "error";
      });

    builder.addCase(generateAggregation.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(generateAggregation.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(generateAggregation.rejected, (state, action) => {
        state.loadedState = "error";
      });

    builder.addCase(generateAggregationBatch.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(generateAggregationBatch.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(generateAggregationBatch.rejected, (state, action) => {
        state.loadedState = "error";
      });

    builder.addCase(generateEmpty.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(generateEmpty.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(generateEmpty.rejected, (state, action) => {
        state.loadedState = "error";
      });

    builder.addCase(removeColumn.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(removeColumn.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(removeColumn.rejected, (state, action) => {
        state.loadedState = "error";
      });
    builder.addCase(removeBatch.pending, (state, action) => {
      state.loadedState = "loading";
    }),
      builder.addCase(removeBatch.fulfilled, (state, action) => {
        state.loadedState = "done";
        state.dataframe = action.payload;
        state.version += 1;
      }),
      builder.addCase(removeBatch.rejected, (state, action) => {
        state.loadedState = "error";
      });
  },
});

export const { renameColumn, setNavioColumns, setDataframe } =
  dataSlice.actions;
export default dataSlice.reducer;

// selector para no duplicar datos
export const selectDataframe = (state) => state.dataframe.dataframe;
