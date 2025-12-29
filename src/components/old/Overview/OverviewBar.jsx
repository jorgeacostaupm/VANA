import React from "react";
import { Typography } from "antd";

import SwitchButton from "./BarButtons/SwitchButton";
import FixButton from "./BarButtons/FixButton";
import ResetButton from "./BarButtons/ResetButton";
import NullQuarantineButton from "./BarButtons/NullQuarantinesButton";
import QuarantineButton from "./BarButtons/QuarantineButton";
import LegendButton from "./BarButtons/LegendButton";

import styles from "@/utils/ChartBar.module.css";
import SettingsButton from "./BarButtons/SettingsButton";
import EditButton from "./BarButtons/EditButton";
import EditValuesButton from "./BarButtons/EditValuesButton";
import ExportButton from "./BarButtons/ExportButton";
import UndoRedoButtons from "./BarButtons/UndoRedoButtons";

const { Text } = Typography;

export default function OverviewBar({ title, config, updateConfig }) {
  return (
    <>
      <div className={styles.chartBar}>
        <div className={`${styles.chartTitle}`}>{title}</div>

        <div className={styles.right}>
          <NullQuarantineButton />
          <QuarantineButton />
          <SwitchButton />

          {/* <div className={styles.separator} />

          <FixButton />
          <ResetButton /> */}
          {/* <div className={styles.separator} />
          <UndoRedoButtons></UndoRedoButtons> */}

          <div className={styles.separator} />

          <LegendButton />
          <EditValuesButton></EditValuesButton>
          <EditButton></EditButton>
          <ExportButton></ExportButton>
          <SettingsButton
            config={config}
            updateConfig={updateConfig}
          ></SettingsButton>
        </div>
      </div>
    </>
  );
}

/* useEffect(() => {
    function handleClickOutside(event) {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    }

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]); */
