import React, { useEffect, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { Layout } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import Panel from "./Panel/Panel";
import Categoric from "./Categoric/Categoric";
import PointRange from "./Test/PointRange";
import Pairwise from "./Test/Pairwise";
import Ranking from "./Ranking/Ranking";
import tests from "@/utils/tests";

import { setInit } from "@/store/slices/compareSlice";

import { Apps, APP_NAME } from "@/utils/Constants";
import useNotification from "@/utils/useNotification";
import useRootStyles from "@/utils/useRootStyles";

import { pubsub } from "@/utils/pubsub";
import { selectCategoricalVars } from "@/store/slices/cantabSlice";
import { VariableTypes } from "@/utils/Constants";
import styles from "@/utils/App.module.css";
import Numeric from "./Numeric/Numeric";

const { publish } = pubsub;
const wideCharts = ["ranking", "distribution", "categoric-distribution"];
const ResponsiveGridLayout = WidthProvider(GridLayout);

function App() {
  const categoricalVars = useSelector(selectCategoricalVars);

  const [views, setViews] = useState([]);
  const [layout, setLayout] = useState([]);

  const createView = useCallback((type, props) => {
    const id = `${type}-${Date.now()}`;
    const defaultW = wideCharts.includes(type) ? 12 : 6;
    const defaultH = 4;

    setViews((prev) => [{ id, type, ...props }, ...prev]);

    setLayout((prev) => [
      {
        i: id,
        x: type === "means" ? 6 : 0,
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

  const generateDistribution = (variable) => {
    if (categoricalVars.includes(variable))
      createView("categoric-distribution", { variable });
    else createView("distribution", { variable });
  };

  const generateTest = (test, variable) => {
    const testObj = tests.find((t) => t.label === test);
    const props = { variable, test };
    createView("pairwise", props);
    if (testObj.variableType === VariableTypes.NUMERICAL)
      createView("means", props);
  };

  const generateRanking = (test) => createView("ranking", { test });

  return (
    <Layout className={styles.fullScreenLayout}>
      <Panel
        generateDistribution={generateDistribution}
        generateTest={generateTest}
        generateRanking={generateRanking}
      />

      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={setLayout}
        cols={12}
        rowHeight={100}
        draggableHandle=".drag-handle"
        containerPadding={[10, 10]}
      >
        {views.map((v) => (
          <div key={v.id}>
            {v.type === "means" && (
              <PointRange {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "pairwise" && (
              <Pairwise {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "distribution" && (
              <Numeric {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "categoric-distribution" && (
              <Categoric {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "ranking" && (
              <Ranking {...v} remove={() => removeView(v.id)} />
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </Layout>
  );
}

export default function Compare() {
  const groupVar = useSelector((s) => s.cantab.present.groupVar);
  const navioCols = useSelector((s) => s.dataframe.present.navioColumns);

  useRootStyles(setInit, APP_NAME + " - " + Apps.COMPARE);
  const holder = useNotification();

  useEffect(() => {
    let config = null;
    if (!navioCols) {
      config = {};
    } else if (groupVar && !navioCols.includes(groupVar)) {
      config = {
        message: "Invalid grouping variable",
        description: "Please select a different group variable.",
        type: "warning",
      };
    }
    if (config?.message) publish("notification", config);
  }, [groupVar, navioCols]);

  return (
    <>
      {holder}
      <App />
    </>
  );
}
