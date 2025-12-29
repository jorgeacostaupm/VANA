import React, { useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

import Settings from "./Settings";
import useScatter from "./useScatter";
import useScatterData from "./useScatterData";
import ViewContainer from "@/utils/ViewContainer";
import ChartWithLegend from "@/utils/ChartWithLegend";

function Chart({ data, id, config }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useScatter({ chartRef, legendRef, data, config });

  return <ChartWithLegend id={id} chartRef={chartRef} legendRef={legendRef} />;
}

export default function ScatterMatrix({ id, remove }) {
  const groupVar = useSelector((s) => s.cantab.present.groupVar);

  const [config, setConfig] = useState({
    isSync: true,
    pointSize: 4,
    groupVar: groupVar,
    variables: [],
  });

  const [data] = useScatterData(config.isSync, config);

  const chart = useMemo(() => {
    return <Chart data={data} config={config} id={id} />;
  }, [config, data]);

  return (
    <ViewContainer
      title={`Scatter Plot Matrix`}
      svgIDs={[id, `${id}-legend`]}
      remove={remove}
      settings={<Settings config={config} setConfig={setConfig} />}
      chart={chart}
      config={config}
      setConfig={setConfig}
    />
  );
}
