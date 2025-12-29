import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { WarningTwoTone } from "@ant-design/icons";

import { setDataframe } from "@/store/slices/dataSlice";
import { setQuarantineData } from "@/store/slices/cantabSlice";
import { ORDER_VARIABLE } from "@/utils/Constants";
import BarButton from "@/utils/BarButton";
import { pickColumns } from "@/utils/functions";

export default function NullQuarantineButton() {
  const dispatch = useDispatch();
  const navioColumns =
    useSelector((state) => state.dataframe.present.navioColumns) || [];
  const dt = useSelector((state) => state.dataframe.present.dataframe) || [];
  const data = pickColumns(dt, navioColumns);
  const qData =
    useSelector((state) => state.cantab.present.quarantineData) || [];

  const onNullQuarantine = () => {
    const removedRows = data.filter((row) =>
      Object.values(row).some(
        (value) =>
          value === null ||
          value === undefined ||
          (typeof value === "number" && isNaN(value))
      )
    );

    if (removedRows.length === 0) return;

    const newData = dt.filter(
      (row) =>
        !removedRows.some((r) => r[ORDER_VARIABLE] === row[ORDER_VARIABLE])
    );

    dispatch(setDataframe(newData));
    dispatch(setQuarantineData([...qData, ...removedRows]));
  };

  const hasEmptyInSelection = data.some((row) =>
    Object.values(row).some(
      (value) =>
        value === null ||
        value === undefined ||
        (typeof value === "number" && isNaN(value))
    )
  );

  return (
    hasEmptyInSelection && (
      <BarButton
        title="There are empty values in the selection, click to send them to Quarantine"
        onClick={onNullQuarantine}
        icon={<WarningTwoTone twoToneColor={["#000", "#f5dd07"]} />}
      />
    )
  );
}
