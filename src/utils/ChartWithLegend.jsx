import React from "react";
import styles from "@/utils/Charts.module.css";

export default function ChartWithLegend({ id, chartRef, legendRef }) {
  return (
    <div className={styles.chartLegendContainer}>
      <svg ref={chartRef} id={id} className={styles.distributionChart} />

      <div className={styles.legend}>
        <svg ref={legendRef} id={`${id}-legend`} />
      </div>
    </div>
  );
}
