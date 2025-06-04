import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Slider, Form, Typography, message } from "antd";
import CorrChart from "./CorrChart";
import ChartBar from "@/utils/ChartBar";
import { getScatterData, getCategoricalKeys } from "@/utils/functions";
import drawSPMatrix from "./ScatterplotMatrix";
import styles from "@/utils/Charts.module.css";
import useResizeObserver from "@/components/VAPCANTAB/Utils/hooks/useResizeObserver";

const { Option } = Select;
const { Text } = Typography;
const minScatterSize = 300;

export default function Scatterplot({ remove }) {
  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);

  const [config, setConfig] = useState({
    pointSize: 4,
  });

  const [params, setParams] = useState({
    groupVar: null,
    variables: [],
  });

  return (
    <div ref={ref} className={styles.viewContainer}>
      <ChartBar
        title={
          params.groupVar
            ? `Scatterplot Matrix by ${params.groupVar}`
            : "Scatterplot Matrix"
        }
        infoTooltip={"test"}
        svgIds={["spmatrix", "splegend"]}
        remove={remove}
      >
        <Options
          config={config}
          setConfig={setConfig}
          params={params}
          setParams={setParams}
          containerDims={dimensions}
        />
      </ChartBar>

      <CorrChart
        config={config}
        params={params}
        drawChart={drawSPMatrix}
        getChartData={getScatterData}
      />
    </div>
  );
}

function Options({ config, setConfig, params, setParams, containerDims }) {
  const data = useSelector((state) => state.cantab.selection || []);
  const navioColumns = useSelector(
    (state) => state.dataframe.navioColumns || []
  );

  const categoricalVars = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return getCategoricalKeys(data);
  }, [data]);

  useEffect(() => {
    if (
      categoricalVars.length > 0 &&
      !categoricalVars.includes(params.groupVar)
    ) {
      setParams((prev) => ({
        ...prev,
        groupVar: categoricalVars[0],
      }));
    }
  }, [categoricalVars, params.groupVar, setParams]);

  const { width, height } = containerDims;
  const usable = Math.min(width * 0.85, height);
  const maxVars = Math.max(0, Math.floor(usable / minScatterSize));

  useEffect(() => {
    if (params.variables.length > maxVars) {
      setParams((prev) => ({
        ...prev,
        variables: prev.variables.slice(0, maxVars),
      }));
    }
  }, [maxVars, setParams, params.variables]);

  const onGroupVarChange = (value) => {
    setParams((prev) => ({
      ...prev,
      groupVar: value,
    }));
  };

  const onVariablesChange = (values) => {
    if (values.length > maxVars) {
      message.warning(`max: ${maxVars} variables with actual size.`);
      return;
    }
    setParams((prev) => ({
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
    <Form layout="vertical" style={{ maxWidth: 500 }}>
      <Form.Item label="Select grouping variable:">
        <Select
          value={params.groupVar}
          onChange={onGroupVarChange}
          placeholder="Select variable"
          style={{ width: "100%" }}
        >
          {categoricalVars.map((key) => (
            <Option key={key} value={key}>
              {key}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={
          <>
            Variables to show{" "}
            <Text type="secondary">
              (máx. {maxVars} variables según el tamaño actual)
            </Text>
          </>
        }
      >
        <Select
          mode="multiple"
          value={params.variables}
          onChange={onVariablesChange}
          placeholder="Select variables"
          style={{ width: "100%" }}
        >
          {navioColumns.map((key) => (
            <Option key={key} value={key}>
              {key}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Points size:">
        <Slider
          min={1}
          max={20}
          value={config.pointSize}
          onChange={onPointSizeChange}
          style={{ width: "100%" }}
        />
      </Form.Item>
    </Form>
  );
}
