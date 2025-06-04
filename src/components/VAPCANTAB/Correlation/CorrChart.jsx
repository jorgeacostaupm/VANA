import React, { useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import useResizeObserver from "@/components/VAPCANTAB/Utils/hooks/useResizeObserver";
import styles from "@/utils//Charts.module.css";

export default function CorrChart({ config, params, drawChart, getChartData }) {
  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);
  const selection = useSelector((s) => s.cantab.selection);

  const data = useMemo(() => {
    let res = getChartData(selection, params);
    return res;
  }, [selection, params]);

  useEffect(() => {
    console.log(ref.current, data, dimensions);
    if (ref.current && data && dimensions) {
      drawChart(data, config, ref.current, dimensions);
    }
  }, [data, config, dimensions]);

  return <div ref={ref} className={styles.correlationContainer}></div>;
}
