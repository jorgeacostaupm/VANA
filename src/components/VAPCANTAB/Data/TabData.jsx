import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, Typography, Divider, Tooltip } from "antd";
import DragDropData from "./DragDropData";
import {
  setGroupVar,
  setTimeVar,
} from "@/components/VAPUtils/features/cantab/cantabSlice";
import { VariableTypes } from "../../../utils/Constants";
import {
  selectAllVars,
  selectCategoricalVars,
  selectNumericVars,
  selectUnkownVars,
} from "../../VAPUtils/features/cantab/cantabSlice";

const { Title, Text } = Typography;

const DataInfoPanel = () => {
  const dispatch = useDispatch();

  const filename = useSelector((state) => state.dataframe.filename);
  const dt = useSelector((state) => state.dataframe.dataframe);
  const idVar = useSelector((state) => state.cantab.idVar);
  const groupVar = useSelector((state) => state.cantab.groupVar);
  const timeVar = useSelector((state) => state.cantab.timeVar);
  const vars = useSelector(selectAllVars);
  const numericVars = useSelector(selectNumericVars);
  const categoricalVars = useSelector(selectCategoricalVars);
  const unknownVars = useSelector(selectUnkownVars);

  console.log(numericVars, categoricalVars, unknownVars);

  const groupVarChange = (value) => dispatch(setGroupVar(value));
  const timeVarChange = (value) => dispatch(setTimeVar(value));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "50%",
        padding: "50px",
        gap: "1rem",
        borderRight: "1px solid #eee",
      }}
    >
      <Title
        level={4}
        style={{ marginBottom: 0, color: "var(--primary-color)" }}
      >
        Actual Data
      </Title>

      <div>
        <Text style={{ color: "var(--primary-color)" }} strong>
          Name:
        </Text>{" "}
        <Text>{filename || "—"}</Text>
      </div>
      <div>
        <Text style={{ color: "var(--primary-color)" }} strong>
          Items:
        </Text>{" "}
        <Text>{dt?.length || 0}</Text>
      </div>
      <div>
        <Tooltip placement="right" title={numericVars.join(", ")}>
          <Text style={{ color: "var(--primary-color)" }} strong>
            Numerical variables:
          </Text>{" "}
          <Text>{numericVars.length}</Text>
        </Tooltip>
      </div>
      <div>
        <Tooltip placement="right" title={categoricalVars.join(", ")}>
          <Text style={{ color: "var(--primary-color)" }} strong>
            Categorical variables:
          </Text>{" "}
          <Text>{categoricalVars.length}</Text>
        </Tooltip>
      </div>
      <div>
        <Tooltip placement="right" title={unknownVars.join(", ")}>
          <Text style={{ color: "var(--primary-color)" }} strong>
            Unknown variables:
          </Text>{" "}
          <Text>{unknownVars.length}</Text>
        </Tooltip>
      </div>

      <Divider style={{ margin: "1rem" }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "var(--primary-color)" }} strong>
          ID variable:
        </Text>
        <Select
          style={{ width: "60%", marginTop: 0 }}
          value={idVar}
          placeholder="Select ID variable"
          options={vars.map((key) => ({
            label: key,
            value: key,
          }))}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "var(--primary-color)" }} strong>
          Group variable:
        </Text>
        <Select
          style={{ width: "60%", marginTop: 0 }}
          value={groupVar}
          onChange={groupVarChange}
          placeholder="Select group variable"
          options={vars.map((key) => ({
            label: key,
            value: key,
          }))}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "var(--primary-color)" }} strong>
          Time variable:
        </Text>
        <Select
          style={{ width: "60%", marginTop: 0 }}
          value={timeVar}
          onChange={timeVarChange}
          placeholder="Select time variable"
          options={vars.map((key) => ({
            label: key,
            value: key,
          }))}
        />
      </div>
    </div>
  );
};

const UploadPanel = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "50%",
        padding: "50px",
        gap: "1rem",
      }}
    >
      <Title
        level={4}
        style={{ marginBottom: 4, color: "var(--primary-color)" }}
      >
        Upload Data
      </Title>
      <DragDropData />
    </div>
  );
};

export default function TabData() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        minHeight: "400px",
        padding: "1rem",
      }}
    >
      <DataInfoPanel />
      <UploadPanel />
    </div>
  );
}
