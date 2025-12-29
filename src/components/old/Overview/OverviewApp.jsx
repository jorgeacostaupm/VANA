import React from "react";
import { useSelector, shallowEqual } from "react-redux";

import Overview from "./Overview";
import OverviewBar from "./OverviewBar";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import styles from "@/utils/Charts.module.css";
import { setSelection } from "@/store/slices/dataSlice";
import { updateConfig } from "@/store/slices/dataSlice";

export default function OverviewApp() {
  const dt = useSelector((state) => state.dataframe.present.dataframe);
  const config = useSelector((state) => state.dataframe.present.config);

  return (
    <div className={styles.viewContainer}>
      <OverviewBar
        title="Overview"
        config={config}
        updateConfig={updateConfig}
      />

      {dt && dt.length > 0 ? (
        <Overview data={dt} config={config} setSelection={setSelection} />
      ) : (
        <NoDataPlaceholder></NoDataPlaceholder>
      )}
    </div>
  );
}
