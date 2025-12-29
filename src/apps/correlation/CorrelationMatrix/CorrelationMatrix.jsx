import React, { useState, useMemo, useRef } from "react";

import Settings from "./Settings";
import BasicChart from "@/utils/BasicChart";
import useCorrelationMatrix from "./useCorrelationMatrix";
import useCorrelationMatrixData from "./useCorrelationMatrixData";
import ViewContainer from "@/utils/ViewContainer";

const defaultConfig = {
  isSync: true,
  range: [0, 1],
};

const defaultParams = {
  groupVar: null,
  variables: [],
  nTop: 10,
};

function Chart({ data, id, config }) {
  const chartRef = useRef(null);
  useCorrelationMatrix({ chartRef, data: data, config });
  return <BasicChart id={id} chartRef={chartRef} />;
}

export default function CorrelationMatrix({ id, remove }) {
  const [config, setConfig] = useState(defaultConfig);
  const [params, setParams] = useState(defaultParams);
  const [info, setInfo] = useState(null);
  const [data] = useCorrelationMatrixData(config.isSync, params, setInfo);

  const chart = useMemo(() => {
    return <Chart data={data} config={config} id={id} />;
  }, [config, data]);

  return (
    <ViewContainer
      title={`Correlation Matrix`}
      svgIDs={[id, `${id}-legend`]}
      remove={remove}
      settings={
        <Settings
          info
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
