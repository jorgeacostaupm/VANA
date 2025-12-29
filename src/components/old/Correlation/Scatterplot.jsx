import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Slider, Form, Typography, message, Space } from "antd";
import CorrChart from "./CorrChart";
import ChartBar from "@/utils/ChartBar";
import {
  getScatterData,
  getCategoricalKeys,
  generateId,
} from "@/utils/functions";
import drawSPMatrix from "./ScatterplotMatrix";
import styles from "@/utils/Charts.module.css";
import useResizeObserver from "@/utils/useResizeObserver";

const { Option } = Select;
const { Text } = Typography;
const minScatterSize = 200;

export default function Scatterplot({ remove }) {
  const ref = useRef(null);
  const dims = useResizeObserver(ref);
  const id = generateId();

  const groupVar = useSelector((s) => s.cantab.present.groupVar);

  const [config, setConfig] = useState({
    isSync: true,
    pointSize: 4,
    groupVar: groupVar,
    variables: [],
  });

  return (
    <div ref={ref} className={styles.viewContainer}>
      <ChartBar
        title={"Scatterplot Matrix"}
        svgIDs={[id, `${id}-legend`]}
        remove={remove}
        config={config}
        setConfig={setConfig}
        settings={
          <Settings
            config={config}
            setConfig={setConfig}
            containerDims={dims}
          />
        }
      ></ChartBar>

      <CorrChart
        config={config}
        params={config}
        drawChart={drawSPMatrix}
        getChartData={getScatterData}
        id={id}
      />
    </div>
  );
}

function Settings({ config, setConfig, containerDims }) {
  const data = useSelector((state) => state.dataframe.present.selection || []);
  const navioColumns = useSelector(
    (state) => state.dataframe.present.navioColumns || []
  );

  const categoricalVars = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return getCategoricalKeys(data);
  }, [data]);

  useEffect(() => {
    if (
      categoricalVars.length > 0 &&
      !categoricalVars.includes(config.groupVar)
    ) {
      setConfig((prev) => ({
        ...prev,
        groupVar: null,
      }));
    }
  }, [categoricalVars]);

  const { width, height } = containerDims;
  const usable = Math.min(width * 0.85, height);
  const maxVars = Math.max(0, Math.floor(usable / minScatterSize));

  useEffect(() => {
    if (config.variables.length > maxVars) {
      setConfig((prev) => ({
        ...prev,
        variables: prev.variables.slice(0, maxVars),
      }));
    }
  }, [maxVars, config.variables]);

  const onGroupVarChange = (value) => {
    setConfig((prev) => ({
      ...prev,
      groupVar: value,
    }));
  };

  const onVariablesChange = (values) => {
    if (values.length > maxVars) {
      message.warning(`max: ${maxVars} variables with actual size.`);
      return;
    }
    setConfig((prev) => ({
      ...prev,
      variables: values,
    }));
  };

  const onPointSizeChange = (value) => {
    setConfig((prev) => ({
      ...prev,
      pointSize: value,
    }));
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "400px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "15px",
        }}
      >
        <Text strong>Grouping Variable</Text>
        <Select
          value={config.groupVar}
          onChange={onGroupVarChange}
          placeholder="Select variable"
          style={{ flex: 1 }}
        >
          {categoricalVars.map((key) => (
            <Option key={key} value={key}>
              {key}
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text strong>Included Variables</Text>
        <Text type="secondary">(máx.{maxVars} due to actual window size)</Text>
      </div>

      <Select
        mode="multiple"
        value={config.variables}
        onChange={onVariablesChange}
        placeholder="Select variables"
        style={{ width: "100%", maxWidth: "400px" }}
        disabled={!config.isSync}
      >
        {navioColumns.map((key) => (
          <Option key={key} value={key}>
            {key}
          </Option>
        ))}
      </Select>

      <div>
        <Text strong>Points radius:</Text>
        <Text type="secondary"> {config.pointSize}px</Text>
      </div>

      <Slider
        min={1}
        max={20}
        value={config.pointSize}
        onChange={onPointSizeChange}
        style={{ width: "100%" }}
      />
    </Space>
  );
}
