import React, { useState, useMemo } from "react";
import { getDistributionData as getData, generateId } from "@/utils/functions";
import useDistributionData from "../useDistributionData";
import ViewContainer from "../../../../utils/ViewContainer";

import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import Settings from "./Settings";
import Density from "./Density/Density";
import Histogram from "./Histogram/Histogram";

const defaultConfig = {
  chartType: "density",
  isSync: true,
  useCustomRange: false,
  range: [null, null],
  nPoints: 30,
  margin: 0.5,
  xForce: 0.05,
  yForce: 1.0,
  collideForce: 0.8,
  alpha: 0.8,
  alphaDecay: 0.2,
  timeout: 500,
  pointSize: 5,
};
const info = "";

export default function Numeric({ variable, remove }) {
  const id = generateId();
  const [config, setConfig] = useState(defaultConfig);

  const [data] = useDistributionData(getData, variable, config.isSync);

  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return <NoDataPlaceholder />;
    } else if (config.chartType === "density") {
      return <Density data={data} config={config} id={id} />;
    } else {
      return <Histogram data={data} config={config} id={id} />;
    }
  }, [config, data]);

  return (
    <ViewContainer
      title={`${variable} - Distribution`}
      svgIDs={[id, `${id}-legend`]}
      info={info}
      remove={remove}
      settings={<Settings config={config} setConfig={setConfig} />}
      chart={chart}
      config={config}
      setConfig={setConfig}
    />
  );
}
