import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getDistributionData } from "@/utils//functions";
import DistributionsPlot from "./DistributionsPlot";
import useResizeObserver from "@/components/VAPCANTAB/Utils/hooks/useResizeObserver";
import ChartBar from "@/utils/ChartBar";
import styles from "@/utils//Charts.module.css";

export default function Distributions({ variable, remove }) {
  const [chart, setChart] = useState(null);

  const selection = useSelector((state) => state.cantab.selection);
  const groupVar = useSelector((state) => state.cantab.groupVar);

  const estimator = useSelector((state) => state.compare.estimator);
  const nPoints = useSelector((state) => state.compare.nPoints);
  const range = useSelector((state) => state.compare.distrRange);
  const pointSize = useSelector((state) => state.compare.pointSize);

  const ref = useRef(null);
  const refLegend = useRef(null);
  const dimensions = useResizeObserver(ref);

  useEffect(() => {
    const distributions = new DistributionsPlot(ref.current);
    setChart(distributions);
  }, []);

  useEffect(() => {
    if (chart?.data && dimensions) {
      chart.onResize(dimensions);
    }
  }, [dimensions]);

  useEffect(() => {
    if (variable && chart) {
      const data = getDistributionData(selection, variable, groupVar);
      chart.data = data;
      chart.nPoints = nPoints;
      chart.estimator = estimator;
      chart.pointSize = pointSize;
      chart.range = range;
      chart.updateVis();
    }
  }, [
    selection,
    groupVar,
    variable,
    estimator,
    nPoints,
    pointSize,
    range,
    chart,
  ]);

  return (
    <>
      <div className={styles.viewContainer}>
        <ChartBar
          title={`${variable} - Distribution`}
          svgIds={["compare-lines-legend", "compare-distr"]}
          infoTooltip={"Distribution plots, Swarmplot, Density and Histogram"}
          remove={remove}
        >
          <Options></Options>
        </ChartBar>
        <div
          className={styles.chartLegendContainer}
          style={{ display: "flex", flexDirection: "row" }}
        >
          <div className={styles.legend}>
            <svg
              ref={refLegend}
              id="compare-lines-legend"
              className={styles.legendSvg}
            />
          </div>

          <div className={styles.distributionChart}>
            <svg id="compare-distr" ref={ref} className={styles.chartSvg} />
          </div>
        </div>
      </div>
    </>
  );
}

import { Typography, Space, Radio, Slider } from "antd";
import {
  setEstimator,
  setDistrRange,
  setNPoints,
  setPointSize,
} from "@/components/VAPUtils/features/compare/compareSlice";

const { Text } = Typography;
function Options() {
  const dispatch = useDispatch();
  const estimator = useSelector((s) => s.compare.estimator);
  const pointSize = useSelector((s) => s.compare.pointSize);
  const nPoints = useSelector((s) => s.compare.nPoints);
  const distrRange = useSelector((s) => s.compare.distrRange);

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div>
        <Text strong style={{ fontSize: "16px" }}>
          Select graph:
        </Text>
        <Radio.Group
          style={{ marginLeft: 16 }}
          optionType="button"
          buttonStyle="solid"
          value={estimator}
          onChange={(e) => dispatch(setEstimator(e.target.value))}
        >
          <Radio.Button value="density">Density</Radio.Button>
          <Radio.Button value="histogram">Histogram</Radio.Button>
          <Radio.Button value="swarm">Swarm Plot</Radio.Button>
        </Radio.Group>
      </div>

      {estimator === "swarm" && (
        <div>
          <Text strong style={{ fontSize: "16px" }}>
            Point size:
          </Text>
          <Text type="secondary"> {pointSize}px</Text>
          <Slider
            min={0}
            max={20}
            value={pointSize}
            onChange={(v) => dispatch(setPointSize(v))}
            step={1}
          />
        </div>
      )}

      {estimator !== "swarm" && (
        <div>
          <Text strong style={{ fontSize: "16px" }}>
            Bins:
          </Text>
          <Text type="secondary"> {nPoints}</Text>
          <Slider
            min={1}
            max={250}
            value={nPoints}
            onChange={(v) => dispatch(setNPoints(v))}
            step={1}
          />
        </div>
      )}

      {estimator === "density" && (
        <div>
          <Text strong style={{ fontSize: "16px" }}>
            Margins range:
          </Text>
          <Text type="secondary"> {(distrRange * 100).toFixed(0)}%</Text>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={distrRange}
            onChange={(v) => dispatch(setDistrRange(v))}
          />
        </div>
      )}
    </Space>
  );
}
