import React from "react";

import LegendButton from "@/components/Buttons/LegendButton";
import SwitchButton from "@/components/Buttons/SwitchButton";
import SettingsButton from "@/components/Buttons/SettingsButton";
import RestoreDataButton from "@/components/Buttons/RestoreDataButton";

import styles from "@/utils/ChartBar.module.css";

export default function Bar({ title, config, updateConfig }) {
  return (
    <div className={styles.chartBar}>
      <div className={styles.chartTitle}>{title}</div>

      <div className={styles.right}>
        <RestoreDataButton />
        <SwitchButton />
        <LegendButton />
        <SettingsButton config={config} updateConfig={updateConfig} />
      </div>
    </div>
  );
}
