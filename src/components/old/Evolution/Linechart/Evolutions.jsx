import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Switch, Slider, Typography, InputNumber, Divider } from "antd";

import styles from "@/utils/Charts.module.css";
import ChartBar from "@/utils/ChartBar";
import { generateId, getEvolutionData } from "@/utils/functions";
import useResizeObserver from "@/utils/useResizeObserver";
import EvolutionsPlot from "./EvolutionsPlot";
import { pubsub } from "@/utils/pubsub";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
const { publish } = pubsub;
const { Text } = Typography;

export default function Evolutions({ variable, remove }) {
  const ref = useRef(null);
  const refLegend = useRef(null);
  const dims = useResizeObserver(ref);
  const id = generateId();

  const selection = useSelector((s) => s.dataframe.present.selection);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);
  const timeVar = useSelector((s) => s.cantab.present.timeVar);
  const idVar = useSelector((s) => s.cantab.present.idVar);

  const [data, setData] = useState(null);
  const [chart, setChart] = useState(null);
  const [config, setConfig] = useState({
    isSync: true,
    showObs: false,
    showMeans: true,
    showStds: true,
    range: [null, null],
    useCustomRange: false,
    meanPointSize: 10,
    subjectPointSize: 3,
    meanStrokeWidth: 5,
    subjectStrokeWidth: 1,
    variable: variable,
  });

  useEffect(() => {
    const evo = new EvolutionsPlot(ref.current);
    setChart(evo);
  }, []);

  useEffect(() => {
    if (chart?.data && dims) chart.onResize(dims);
  }, [chart, dims]);

  useEffect(() => {
    if (!config.isSync || !variable) {
      return;
    }
    try {
      const res = getEvolutionData(
        selection,
        variable,
        groupVar,
        timeVar,
        idVar
      );
      setData(res);
    } catch (err) {
      const config = {
        message: "Error computing data",
        description: err.message,
        type: "error",
      };
      publish("notification", config);
      setData(null);
    }
  }, [config.isSync, variable, selection, groupVar, timeVar, idVar]);

  useEffect(() => {
    if (!chart || !data) return;
    chart.data = data;
    chart.config = config;
    chart.updateVis();
  }, [chart, data, config]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={`${variable} Evolution`}
        svgIDs={[`${id}-legend`, id]}
        remove={remove}
        config={config}
        setConfig={setConfig}
        settings={<Settings config={config} setConfig={setConfig} />}
      />

      {!data && <NoDataPlaceholder></NoDataPlaceholder>}

      <div
        className={styles.chartLegendContainer}
        style={{ display: data ? "flex" : "none" }}
      >
        <div className={styles.distributionChart}>
          <svg id={id} ref={ref} className={styles.chartSvg} />
        </div>
        <div className={styles.legend}>
          <svg
            ref={refLegend}
            id={`${id}-legend`}
            className={styles.legendSvg}
          />
        </div>
      </div>
    </div>
  );
}

function Settings({ config, setConfig }) {
  const {
    showObs,
    showMeans,
    showStds,
    meanPointSize,
    subjectPointSize,
    meanStrokeWidth,
    subjectStrokeWidth,
    range,
    useCustomRange,
  } = config;
  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Show Means</Text>
        <Switch checked={showMeans} onChange={(v) => update("showMeans", v)} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Show Standard Deviation</Text>
        <Switch checked={showStds} onChange={(v) => update("showStds", v)} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Show Observations</Text>
        <Switch checked={showObs} onChange={(v) => update("showObs", v)} />
      </div>

      <Divider></Divider>

      <SliderControl
        label="Mean Point Size"
        value={meanPointSize}
        min={1}
        max={40}
        onChange={(v) => update("meanPointSize", v)}
      />
      <SliderControl
        label="Subject Point Size"
        value={subjectPointSize}
        min={1}
        max={20}
        onChange={(v) => update("subjectPointSize", v)}
      />
      <SliderControl
        label="Mean Stroke Width"
        value={meanStrokeWidth}
        min={1}
        max={30}
        onChange={(v) => update("meanStrokeWidth", v)}
      />
      <SliderControl
        label="Subject Stroke Width"
        value={subjectStrokeWidth}
        min={1}
        max={10}
        onChange={(v) => update("subjectStrokeWidth", v)}
      />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>Custom Y range</Text>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        min:
        <InputNumber
          value={range[0]}
          onChange={(val) => update("range", [val ?? range[0], range[1]])}
        />
        max:
        <InputNumber
          value={range[1]}
          onChange={(val) => update("range", [range[0], val ?? range[1]])}
        />
        <Switch
          checked={useCustomRange}
          onChange={(checked) => update("useCustomRange", checked)}
        />
      </div>
    </>
  );
}

function SliderControl({ label, value, min, max, onChange }) {
  return (
    <div>
      <Text strong>{label}</Text>
      <Text type="secondary" style={{ marginLeft: 8 }}>
        {value}px
      </Text>
      <Slider min={min} max={max} step={1} value={value} onChange={onChange} />
    </div>
  );
}
