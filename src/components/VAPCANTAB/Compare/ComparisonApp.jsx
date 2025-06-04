// ComparisonApp.jsx (Refactor y limpieza mejorada)
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, notification } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import NoData from "@/components/VAPConnectivity/components/NoData";
import Panel from "./Panel";
import Distributions from "./Distributions";
import CategoricDistributions from "./CategoricDistributions";
import PointRange from "./PointRange";
import Pairwise from "./Pairwise";
import Ranking from "./Ranking";
import tests from "@/utils/tests";

import {
  setInit,
  setSelectedVar,
  setSelectedTest,
  checkAssumptions,
} from "@/components/VAPUtils/features/compare/compareSlice";

import { Apps } from "@/utils/Constants";
import { useNotificationSubscription } from "@/components/VAPCANTAB/Utils/hooks/cantabAppHooks";
import useRootStyles from "@/components/VAPUtils/useRootStyles";

import { pubsub } from "@/components/VAPUtils/pubsub";
import {
  selectVars,
  selectCategoricalVars,
} from "../../VAPUtils/features/cantab/cantabSlice";
import { VariableTypes } from "../../../utils/Constants";

const { publish } = pubsub;
const wideCharts = ["ranking", "distribution", "categoric-distribution"];
const ResponsiveGridLayout = WidthProvider(GridLayout);

function App() {
  const dispatch = useDispatch();
  const variables = useSelector(selectVars);
  const categoricalVars = useSelector(selectCategoricalVars);

  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const selectedTest = useSelector((s) => s.compare.selectedTest);
  const assumptions = useSelector((s) => s.compare.assumptions);

  const [views, setViews] = useState([]);
  const [layout, setLayout] = useState([]);

  const createView = useCallback(
    (type, props) => {
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
    },
    [selectedVar, selectedTest]
  );

  const removeView = useCallback((id) => {
    setViews((prev) => prev.filter((v) => v.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  }, []);

  useEffect(() => {
    if (!variables.includes(selectedVar)) dispatch(setSelectedVar(null));
  }, [variables, selectedVar]);

  useEffect(() => {
    if (selectedVar) dispatch(checkAssumptions());
  }, [selectedVar]);

  const generateDistribution = () => {
    if (categoricalVars.includes(selectedVar))
      createView("categoric-distribution", { variable: selectedVar });
    else createView("distribution", { variable: selectedVar });
  };

  const generateTest = () => {
    const testObj = tests.find((t) => t.label === selectedTest);
    const props = { variable: selectedVar, test: selectedTest };
    createView("pairwise", props);
    if (testObj.variableType === VariableTypes.NUMERICAL)
      createView("means", props);
  };
  const generateRanking = () => createView("ranking", { test: selectedTest });

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
        onVarChange={(v) => dispatch(setSelectedVar(v))}
        onTestChange={(v) => dispatch(setSelectedTest(v))}
        generateDistribution={generateDistribution}
        generateTest={generateTest}
        generateRanking={generateRanking}
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
            {v.type === "means" && (
              <PointRange {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "pairwise" && (
              <Pairwise {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "distribution" && (
              <Distributions {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "categoric-distribution" && (
              <CategoricDistributions {...v} remove={() => removeView(v.id)} />
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

export default function ComparisonApp() {
  const [isOk, setIsOk] = useState(false);
  const [apiNotif, holder] = notification.useNotification();

  const groupVar = useSelector((s) => s.cantab.groupVar);
  const pops = useSelector((s) => s.cantab.selectionGroups);
  const navioCols = useSelector((s) => s.dataframe.navioColumns);

  useRootStyles({ padding: 0, maxWidth: "100vw" }, setInit, Apps.COMPARE);
  useNotificationSubscription(apiNotif);

  useEffect(() => {
    let config = null;
    if (!groupVar || !pops || !navioCols) {
      config = {};
    } else if (!navioCols.includes(groupVar)) {
      config = {
        message: "Invalid grouping variable",
        description: "Please select a different grouping variable.",
        type: "error",
      };
    }
    setIsOk(!config);
    if (config?.message) publish("notification", config);
  }, [groupVar, pops, navioCols]);

  return (
    <>
      {holder}
      {isOk ? <App /> : <NoData />}
    </>
  );
}
