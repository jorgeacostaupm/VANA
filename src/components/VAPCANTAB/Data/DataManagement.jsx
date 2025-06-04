import React from "react";
import { DatabaseOutlined } from "@ant-design/icons";
import { Tabs, Tooltip } from "antd";
import AppModal from "@/utils/AppModal";
import TabData from "./TabData";
import TabHierarchy from "./TabHierarchy";
import styles from "./Data.module.css";

const items = [
  {
    key: "data",
    label: "Data",
    children: <TabData />,
  },
  {
    key: "hierarchy",
    label: "Hierarchy",
    children: <TabHierarchy />,
  },
];

const iconStyle = { fontSize: "40px" };

export default function DataManagement() {
  return (
    <Tooltip placement="bottom">
      <AppModal
        tooltipTitle={"Open App Management"}
        icon={<DatabaseOutlined style={iconStyle} />}
      >
        <Tabs
          className={styles.customTabs}
          defaultActiveKey="data"
          items={items}
        />
      </AppModal>
    </Tooltip>
  );
}

export function HierarchyManagement() {
  return (
    <AppModal
      tooltipTitle={"Open Hierarchy Management"}
      icon={<DatabaseOutlined style={iconStyle} />}
    >
      <div className={styles.customTabs}>
        <TabHierarchy />
      </div>
    </AppModal>
  );
}
