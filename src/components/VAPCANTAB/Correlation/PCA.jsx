import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Form, Slider } from "antd";
import ChartBar from "@/utils/ChartBar";
import { getPCAData, getCategoricalKeys } from "@/utils/functions";
import drawPCAPlot from "./PCAPlot";
import styles from "@/utils/Charts.module.css";
import useResizeObserver from "@/utils/useResizeObserver";

const { Option } = Select;

export default function PCA({ remove }) {
  const [config, setConfig] = useState({
    groupVar: null,
  });

  const [params, setParams] = useState({
    groupVar: null,
    variables: [],
  });

  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);
  const selection = useSelector((s) => s.cantab.selection);

  const data = useMemo(() => {
    let res = getPCAData(selection, params);
    return res;
  }, [selection, params]);

  useEffect(() => {
    if (ref.current && data && dimensions) {
      drawPCAPlot(data.points, config, ref.current, dimensions);
    }
  }, [data, config, dimensions]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={`PCA - ${params.variables.length} Variables`}
        infoTooltip={data.summary}
        svgIds={["chart", "chart-legend"]}
        remove={remove}
      >
        <Options
          config={config}
          setConfig={setConfig}
          params={params}
          setParams={setParams}
        />
      </ChartBar>

      <div ref={ref} className={styles.correlationContainer}></div>
    </div>
  );
}

function Options({ config, setConfig, params, setParams }) {
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
      setConfig((prev) => ({
        ...prev,
        groupVar: categoricalVars[0],
      }));
    }
  }, [categoricalVars, params.groupVar, setConfig]);

  const onGroupVarChange = (value) => {
    setConfig((prev) => ({
      ...prev,
      groupVar: value,
    }));
  };

  const onVariablesChange = (values) => {
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
          value={config.groupVar}
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

      <Form.Item>
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
