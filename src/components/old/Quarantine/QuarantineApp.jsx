import React from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Layout } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import styles from "@/utils/Charts.module.css";
import {
  setQuarantineSelection,
  setInitQuarantine,
} from "@/store/slices/cantabSlice";
import Overview from "../old/Overview/Overview";
import QuarantineBar from "./QuarantineBar";
import useNotification from "@/utils/useNotification";
import useRootStyles from "@/utils/useRootStyles";
import { APP_NAME, Apps } from "@/utils/Constants";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import { updateConfig } from "@/store/slices/cantabSlice";

const ResponsiveGridLayout = WidthProvider(GridLayout);
const layout = [
  {
    i: "quarantine",
    x: 0,
    y: 0,
    w: 12,
    h: 12,
  },
];

export default function QuarantineApp() {
  useRootStyles(setInitQuarantine, APP_NAME + " - " + Apps.QUARANTINE);
  const holder = useNotification();

  return (
    <>
      {holder}
      <Layout
        style={{
          height: "100vh",
          width: "100vw",
          background: "#f0f2f5",
          overflow: "auto",
        }}
      >
        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={95}
          draggableHandle=".drag-handle"
          containerPadding={[10, 10]}
        >
          <div key="quarantine">
            <Quarantine />
          </div>
        </ResponsiveGridLayout>
      </Layout>
    </>
  );
}

const Quarantine = () => {
  const dt = useSelector(
    (state) => state.cantab.present.quarantineData,
    shallowEqual
  );
  const config = useSelector((state) => state.cantab.present.config);

  return (
    <div className={styles.viewContainer}>
      <QuarantineBar
        title="Quarantine"
        config={config}
        updateConfig={updateConfig}
      />

      {dt && dt.length > 0 ? (
        <Overview
          config={config}
          data={dt}
          setSelection={setQuarantineSelection}
        />
      ) : (
        <NoDataPlaceholder message="No quarantine data available"></NoDataPlaceholder>
      )}
    </div>
  );
};
