import React, { useEffect, useState, useCallback, useMemo } from "react";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { useSelector, useDispatch } from "react-redux";
import { Layout, notification } from "antd";

import { Apps, Graphs } from "@/utils/Constants";
import NoData from "@/components/VAPConnectivity/components/NoData";
import { pubsub } from "@/components/VAPUtils/pubsub";

import {
  setSelectedVar,
  setSelectedTest,
} from "@/components/VAPUtils/features/compare/compareSlice";

import { setInit } from "@/components/VAPUtils/features/correlation/correlationSlice";
import { useNotificationSubscription } from "@/components/VAPCANTAB/Utils/hooks/cantabAppHooks";
import useRootStyles from "@/components/VAPUtils/useRootStyles";
import Panel from "./Panel";
import Scatterplot from "./Scatterplot";
import Correlation from "./Correlation";
import PCA from "./PCA";
import UMAP from "./UMAP";
const { publish } = pubsub;
const ResponsiveGridLayout = WidthProvider(GridLayout);

function App() {
  const dispatch = useDispatch();
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const assumptions = useSelector((s) => s.compare.assumptions);

  const [views, setViews] = useState([]);
  const [layout, setLayout] = useState([]);

  const createView = useCallback((type) => {
    const id = `${type}-${Date.now()}`;
    const defaultW = 5;
    const defaultH = 8;

    setViews((prev) => [{ id, type }, ...prev]);

    setLayout((prev) => [
      {
        i: id,
        x: 0,
        y: 0,
        w: defaultW,
        h: defaultH,
      },
      ...prev.map((l) => ({ ...l, y: l.y + defaultH })),
    ]);
  }, []);

  const removeView = useCallback((id) => {
    setViews((prev) => prev.filter((v) => v.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  }, []);

  function generateGraph(selectedVar) {
    createView(selectedVar);
  }

  return (
    <Layout
      style={{
        height: "100vh",
        width: "100vw",
        background: "#f0f2f5",
        overflow: "auto",
      }}
    >
      <Panel
        selectedVar={selectedVar}
        onVarChange={(v) => dispatch(setSelectedVar(v))}
        onTestChange={(v) => dispatch(setSelectedTest(v))}
        generateGraph={generateGraph}
        assumptions={assumptions}
      />

      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={setLayout}
        cols={12}
        rowHeight={100}
        draggableHandle=".drag-handle"
        margin={[5, 5]}
        containerPadding={[20, 20]}
      >
        {views.map((v) => (
          <div key={v.id}>
            {v.type === Graphs.SCATTER && (
              <Scatterplot remove={() => removeView(v.id)} />
            )}
            {v.type === Graphs.CORRELATION && (
              <Correlation remove={() => removeView(v.id)} />
            )}
            {v.type === Graphs.PCA && <PCA remove={() => removeView(v.id)} />}
            {v.type === Graphs.UMAP && <UMAP remove={() => removeView(v.id)} />}
          </div>
        ))}
      </ResponsiveGridLayout>
    </Layout>
  );
}

export default function CorrelationApp() {
  const [isOk, setIsOk] = useState(false);
  const [apiNotif, holder] = notification.useNotification();

  const groupVar = useSelector((s) => s.cantab.groupVar);
  const selection = useSelector((state) => state.cantab.selection);
  const navioCols = useSelector((s) => s.dataframe.navioColumns);

  useRootStyles({ padding: 0, maxWidth: "100vw" }, setInit, Apps.CORRELATION);
  useNotificationSubscription(apiNotif);

  useEffect(() => {
    let config = null;
    if (!groupVar || !selection || !navioCols) {
      config = {};
    }
    setIsOk(!config);
    if (config?.message) publish("notification", config);
  }, [groupVar, selection, navioCols]);

  return (
    <>
      {holder}
      {isOk ? <App /> : <NoData />}
    </>
  );
}
