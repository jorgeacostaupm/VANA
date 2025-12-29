import React from "react";
import styles from "@/utils/Charts.module.css";

export default function BasicChart({ id, chartRef }) {
  return <svg ref={chartRef} id={id} className={styles.chartSvg} />;
}
