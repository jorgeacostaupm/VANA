import React, { useState, useMemo, useRef } from "react";

import Settings from "./Settings";
import ChartWithLegend from "@/utils/ChartWithLegend";
import usePCAPlot from "./usePCAPlot";
import usePCAData from "./usePCAData";
import ViewContainer from "@/utils/ViewContainer";

const defaultConfig = {
  isSync: true,
  pointSize: 2,
};

const defaultParams = {
  groupVar: null,
  variables: [],
  nTop: 10,
};

function Chart({ data, id, config }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  usePCAPlot({ chartRef, legendRef, data, config });

  return <ChartWithLegend id={id} chartRef={chartRef} legendRef={legendRef} />;
}

export default function PCA({ id, remove }) {
  const [config, setConfig] = useState(defaultConfig);
  const [params, setParams] = useState(defaultParams);
  const [info, setInfo] = useState(null);
  const [data] = usePCAData(config.isSync, params, setInfo);

  const chart = useMemo(() => {
    return <Chart data={data} config={config} id={id} />;
  }, [config, data]);

  return (
    <ViewContainer
      title={`PCA - ${params.variables.length} Variables`}
      svgIDs={[id, `${id}-legend`]}
      remove={remove}
      settings={
        <Settings
          info={info}
          config={config}
          setConfig={setConfig}
          params={params}
          setParams={setParams}
        />
      }
      chart={chart}
      config={config}
      setConfig={setConfig}
      info={info}
    />
  );
}
