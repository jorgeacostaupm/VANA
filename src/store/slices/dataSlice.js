import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as aq from "arquero";

import undoable, { includeAction } from "redux-undo";
import {
  generateColumn,
  generateColumnBatch,
  generateEmpty,
  removeBatch,
  removeColumn,
} from "../async/dataAsyncReducers";

import { ORDER_VARIABLE } from "@/utils/Constants";
import {
  updateHierarchy,
  buildMetaFromVariableTypes,
} from "../async/metaAsyncReducers";

import {
  generateTree,
  getVisibleNodes,
  hasEmptyValues,
  pickColumns,
  getVariableTypes,
} from "@/utils/functions";
import { setQuarantineData } from "./cantabSlice";

const initialState = {
  filename: null,

  dataframe: null,
  original: null,

  selection: null,
  selectionIds: null,

  hasEmptyValues: false,

  navioColumns: [],
  version: -1,

  config: {
    attrWidth: 30,
    navioLabelHeight: 150,
    navioHeight: 700,
  },

  nullifiedValues: [],
};

export const convertColumnType = createAsyncThunk(
  "dataframe/convertColumnType",
  async ({ column, dtype }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      let dataframe = aq.from(state.dataframe.present.dataframe);

      let newDf;
      switch (dtype) {
        case "number":
          const data = dataframe.objects();
          const hasInvalid = data.some((row) => {
            const val = row[column];
            if (val === null || val === undefined || val === "") return false;
            return isNaN(Number(val));
          });

          if (hasInvalid) {
            const proceed = window.confirm(
              `⚠️ There are non-numeric values in "${column}".
They will be converted to null, and you may lose information.
Do you want to continue?`
            );

            if (!proceed) {
              // Salir sin hacer cambios
              return rejectWithValue("Update aborted by user");
            }
          }
          newDf = dataframe.derive({
            [column]: (r) => {
              const val = r[column];
              if (val === null || val === undefined || val === "") return null; // vacíos se vuelven null
              const num = Number(val);
              return isNaN(num) ? null : num; // solo valores no numéricos se vuelven null
            },
          });
          break;

        case "string":
          newDf = dataframe.derive({
            [column]: aq.escape((r) =>
              r[column] == null ? null : aq.op.string(r[column])
            ),
          });
          break;

        default:
          throw new Error(`Unsupported dtype: ${dtype}`);
      }

      const newData = newDf.objects();

      dispatch(setDataframe(newData));

      return newData;
    } catch (err) {
      console.error(err);
      return rejectWithValue("Error converting column type");
    }
  }
);

export const replaceValuesWithNull = createAsyncThunk(
  "dataframe/replaceValuesWithNull",
  async (value, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      let dataframe = state.dataframe.present.dataframe;
      let quarantineData = state.cantab.present.quarantineData || [];
      const cols = state.metadata.attributes;

      dataframe = dataframe.map((row) => {
        const newRow = { ...row };
        Object.keys(newRow).forEach((key) => {
          if (newRow[key] == value) {
            newRow[key] = null;
          }
        });
        return newRow;
      });

      quarantineData = quarantineData.map((row) => {
        const newRow = { ...row };
        Object.keys(newRow).forEach((key) => {
          if (newRow[key] == value) {
            newRow[key] = null;
          }
        });
        return newRow;
      });

      dispatch(setDataframe(dataframe));
      dispatch(setQuarantineData(quarantineData));

      await dispatch(generateColumnBatch({ cols }));

      return {
        value,
      };
    } catch (err) {
      return rejectWithValue("Something went wrong nullifiying values");
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
      let meta = getVariableTypes(data);
      dt = dt.derive({ [ORDER_VARIABLE]: aq.op.row_number() });
      if (isGenerateHierarchy) {
        dispatch(buildMetaFromVariableTypes(meta));
      }
      return {
        filename: filename,
        items: dt.objects(),
        column_names: dt.columnNames().filter((d) => d !== ORDER_VARIABLE),
        isNewColumns: isGenerateHierarchy,
        varTypes: meta,
      };
    } catch (err) {
      return rejectWithValue("Something is wrong with API data");
    }
  }
);

export const dataSlice = createSlice({
  name: "dataframe",
  initialState: initialState,
  reducers: {
    setDataframe: (state, action) => {
      const selection = pickColumns(action.payload, state.navioColumns);
      state.dataframe = action.payload;
      state.selection = selection;
      state.version += 1;

      hasEmptyValues(selection, state);
    },

    setNavioColumns: (state, action) => {
      state.navioColumns = action.payload;
      const selection = pickColumns(state.dataframe, state.navioColumns);
      state.selection = selection;
      hasEmptyValues(selection, state);
    },

    setSelection: (state, action) => {
      const selection = pickColumns(action.payload, state.navioColumns);
      state.selection = selection;

      hasEmptyValues(selection, state);
    },

    renameColumn: (state, action) => {
      const { prevName, newName } = action.payload;
      state.dataframe = aq
        .from(state.dataframe)
        .rename({ [prevName]: newName })
        .objects();

      const navColIdx = state.navioColumns.findIndex((n) => n === prevName);
      state.navioColumns[navColIdx] = newName;

      state.version += 1;
    },

    updateConfig: (state, action) => {
      const { field, value } = action.payload;
      state.config = { ...state.config, [field]: value };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateHierarchy.fulfilled, (state, action) => {
      const { hierarchy } = action.payload;
      const tree = generateTree(hierarchy, 0);
      const filtered = getVisibleNodes(tree);

      state.navioColumns = filtered;
      const selection = pickColumns(state.dataframe, state.navioColumns);
      state.selection = selection;
    });

    builder.addCase(updateData.fulfilled, (state, action) => {
      state.filename = action.payload.filename;

      if (action.payload.isNewColumns) {
        state.navioColumns = action.payload.column_names;
        state.original = action.payload.column_names;
      }

      const selection = pickColumns(action.payload.items, state.navioColumns);
      hasEmptyValues(selection, state);

      state.dataframe = action.payload.items;
      state.selection = selection;
      state.version = 0;
      state.nullifiedValues = [];
    });

    builder
      .addCase(generateColumn.fulfilled, (state, action) => {
        state.dataframe = action.payload.data;
        state.version += 1;
      })
      .addCase(generateColumn.rejected, (state, action) => {});

    builder.addCase(generateColumnBatch.fulfilled, (state, action) => {
      state.dataframe = action.payload.data;
      state.version += 1;
    });

    builder
      .addCase(generateEmpty.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      })
      .addCase(removeColumn.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      })
      .addCase(removeBatch.fulfilled, (state, action) => {
        state.dataframe = action.payload;
        state.version += 1;
      });

    builder.addCase(replaceValuesWithNull.fulfilled, (state, action) => {
      state.nullifiedValues = [...state.nullifiedValues, action.payload.value];
    });
  },
});

export default undoable(dataSlice.reducer, {
  limit: 0,
  undoType: "UNDO_DATA_SLICE",
  redoType: "REDO_DATA_SLICE",
  filter: includeAction([]),
});
export const {
  renameColumn,
  setNavioColumns,
  setDataframe,
  setSelection,
  updateConfig,
  editData,
} = dataSlice.actions;

/* const deriveOperation = (a, o, t, f) => {
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
}; */
