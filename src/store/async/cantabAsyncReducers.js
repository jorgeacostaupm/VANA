import { ORDER_VARIABLE } from "@/utils/Constants";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setDataframe } from "../slices/dataSlice";
import { pickColumns } from "@/utils/functions";

export const nullsToQuarantine = createAsyncThunk(
  "cantab/nulls-to-quarantine",
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const originalDt = getState().dataframe.present.dataframe;
      const cols = getState().dataframe.present.navioColumns;

      const visibleData = pickColumns(originalDt, cols);

      const idsWithNull = visibleData.filter((row) =>
        Object.values(row).some(
          (value) =>
            value === null ||
            value === undefined ||
            (typeof value === "number" && isNaN(value))
        )
      );

      if (idsWithNull.length === 0) return;

      const data = originalDt.filter(
        (row) =>
          !idsWithNull.some((r) => r[ORDER_VARIABLE] === row[ORDER_VARIABLE])
      );
      dispatch(setDataframe(data));

      const quarantineData = originalDt.filter((row) =>
        idsWithNull.some((r) => r[ORDER_VARIABLE] === row[ORDER_VARIABLE])
      );

      return { quarantineData };
    } catch (error) {
      console.error(error);
      return rejectWithValue("Error aggregating values");
    }
  }
);
