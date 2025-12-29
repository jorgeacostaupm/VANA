import { useRef } from "react";

import useStackedBarChart from "./useStackedBarChart";
import ChartWithLegend from "@/utils/ChartWithLegend";

export default function StackedBarChart({ data, config, id }) {
  const chartRef = useRef(null);
  const legendRef = useRef(null);

  useStackedBarChart({ chartRef, legendRef, data, config });

  return <ChartWithLegend id={id} chartRef={chartRef} legendRef={legendRef} />;
}
