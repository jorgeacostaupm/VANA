import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNotificationSubscription } from "@/components/VAPCANTAB/Utils/hooks/cantabAppHooks";
import useRootStyles from "@/components/VAPUtils/useRootStyles";
import {
  setInit,
  setSelectedVar,
  setSelectedTest,
} from "@/components/VAPUtils/features/evolution/evolutionSlice";
import Ranking from "./Ranking";
import Evolutions from "./Evolutions";
import { Layout, notification } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import NoData from "@/components/VAPConnectivity/components/NoData";
import Panel from "./Panel";
import { pubsub } from "@/components/VAPUtils/pubsub";
import { selectVars } from "../../VAPUtils/features/cantab/cantabSlice";
const { publish } = pubsub;
const ResponsiveGridLayout = WidthProvider(GridLayout);

function App() {
  const dispatch = useDispatch();
  const variables = useSelector(selectVars);

  const selectedVar = useSelector((s) => s.evolution.selectedVar);
  const selectedTest = useSelector((s) => s.evolution.selectedTest);

  const [views, setViews] = useState([]);
  const [layout, setLayout] = useState([]);

  const addView = (type, props) => {
    const id = `${type}-${Date.now()}`;
    const defaultW = 12;
    const defaultH = 4;

    setViews((prev) => [
      { id, type, variable: selectedVar, test: selectedTest, ...props },
      ...prev,
    ]);

    setLayout((prev) => {
      const newLayout = [
        {
          i: id,
          x: 0,
          y: 4,
          w: defaultW,
          h: defaultH,
        },
        ...prev.map((l) => ({
          ...l,
          y: l.y + defaultH,
        })),
      ];
      return newLayout;
    });
  };

  const removeView = useCallback((id) => {
    setViews((prev) => prev.filter((v) => v.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  }, []);

  useEffect(() => {
    if (!variables.includes(selectedVar)) dispatch(setSelectedVar(null));
  }, [variables, selectedVar]);

  function generateEvolution() {
    addView("evolution", {
      variable: selectedVar,
    });
  }

  function generateRanking() {
    addView("ranking", {
      test: selectedTest,
    });
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
        variables={variables}
        selectedVar={selectedVar}
        selectedTest={selectedTest}
        onVarChange={(v) => dispatch(setSelectedVar(v))}
        onTestChange={(v) => dispatch(setSelectedTest(v))}
        generateEvolution={generateEvolution}
        generateRanking={generateRanking}
      />

      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        cols={12}
        rowHeight={100}
        draggableHandle=".drag-handle"
        margin={[5, 5]}
        containerPadding={[20, 20]}
      >
        {views.map((v) => (
          <div key={v.id}>
            {v.type === "evolution" && (
              <Evolutions {...v} remove={() => removeView(v.id)} />
            )}
            {v.type === "ranking" && (
              <Ranking
                {...v}
                variables={variables}
                remove={() => removeView(v.id)}
              />
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </Layout>
  );
}

export default function EvolutionApp() {
  const [isOk, setIsOk] = useState(false);
  const [apiNotif, holder] = notification.useNotification();

  const groupVar = useSelector((s) => s.cantab.groupVar);
  const timeVar = useSelector((s) => s.cantab.timeVar);
  const pops = useSelector((s) => s.cantab.selectionGroups);
  const navioCols = useSelector((s) => s.dataframe.navioColumns);

  useRootStyles({ padding: 0, maxWidth: "100vw" }, setInit, "Evolution App");
  useNotificationSubscription(apiNotif);

  useEffect(() => {
    let config = null;
    if (!groupVar || !timeVar || !pops || !navioCols) {
      config = {};
    } else if (!navioCols.includes(groupVar)) {
      config = {
        message: "Invalid grouping/timestamp/id variable",
        description: "Please select a different grouping variable.",
        type: "error",
      };
    }
    setIsOk(!config);
    if (config?.message) publish("notification", config);
  }, [groupVar, timeVar, pops, navioCols]);

  return (
    <>
      {holder}
      {isOk ? <App /> : <NoData />}
    </>
  );
}
