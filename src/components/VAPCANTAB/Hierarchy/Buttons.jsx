import React from "react";
import { DatabaseOutlined } from "@ant-design/icons";
import { Button } from "antd";
import styles from "@/utils/Buttons.module.css";
import { HierarchyManagement } from "../Data/DataManagement";

export default function Buttons() {
  const iconStyle = { fontSize: "40px" }; // Ajusta a tu gusto

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <HierarchyManagement></HierarchyManagement>
    </div>
  );
}
