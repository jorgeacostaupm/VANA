import React from "react";
import { useSelector } from "react-redux";
import { DownloadOutlined } from "@ant-design/icons";

import HierarchyManagementButtons from "@/components/Data/Buttons/HierarchyManagementButton";
import LegendButton from "./LegendButton";
import { Bar } from "@/utils/ChartBar";
import { hierarchySelector } from "@/store/selectors/metaSelectors";
import BarButton from "@/utils/BarButton";
import EditButton from "./EditButton";

function downloadHierarchy(hierarchy) {
  const meta = JSON.stringify(hierarchy, null, 2);
  const blob = new Blob([meta], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = href;
  downloadLink.download = "hierarchy.json";
  downloadLink.click();
}

export default function HierarchyBar() {
  const hierarchy = useSelector(hierarchySelector);

  return (
    <>
      <Bar title={"Hierarchy Editor"} drag={false}>
        {/* <UndoRedoButtons></UndoRedoButtons>
        <div className={styles.separator} /> */}
        <HierarchyManagementButtons></HierarchyManagementButtons>

        <LegendButton />

        <BarButton
          title={"Download hierarchy"}
          onClick={() => downloadHierarchy(hierarchy)}
          icon={<DownloadOutlined />}
        />

        <EditButton></EditButton>
      </Bar>
    </>
  );
}
