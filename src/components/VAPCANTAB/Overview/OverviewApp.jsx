import React from "react";
import Overview from "./Overview";
import { Bar } from "@/utils/ChartBar";
import styles from "@/utils//Charts.module.css";
import OverviewButtons from "./OverviewButtons";

export default function OverviewApp() {
  return (
    <div className={styles.viewContainer}>
      <Bar title={"Navio"}>
        <OverviewButtons></OverviewButtons>
      </Bar>

      <Overview />
    </div>
  );
}
