import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, Typography, Divider } from "antd";
import DragDropHierarchy from "./DragDropHierarchy";
import {
  setGroupVar,
  setTimeVar,
} from "@/components/VAPUtils/features/cantab/cantabSlice";

const { Title, Text } = Typography;

const DataInfoPanel = () => {
  const dispatch = useDispatch();

  const filename = useSelector((state) => state.metadata.filename);
  const dt = useSelector((state) => state.metadata.attributes);
  const groupVar = useSelector((state) => state.cantab.groupVar);
  const timeVar = useSelector((state) => state.cantab.timeVar);

  const variableKeys = dt && dt.length > 0 ? Object.keys(dt[0]) : [];

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
        Actual Hierarchy
      </Title>

      <div>
        <Text style={{ color: "var(--primary-color)" }} strong>
          Name:
        </Text>{" "}
        <Text>{filename || "—"}</Text>
      </div>
      <div>
        <Text style={{ color: "var(--primary-color)" }} strong>
          Nodes:
        </Text>{" "}
        <Text>{dt?.length || 0}</Text>
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
        width: "50%",
        padding: "50px",
        gap: "1rem",
      }}
    >
      <Title
        level={4}
        style={{ marginBottom: 4, color: "var(--primary-color)" }}
      >
        Upload Hierarchy
      </Title>
      <DragDropHierarchy />
    </div>
  );
};

export default function TabHierarchy() {
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
