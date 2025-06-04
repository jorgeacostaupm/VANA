import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Slider, Form } from "antd";
import CorrChart from "./CorrChart";
import ChartBar from "@/utils/ChartBar";
import { getCorrelationData } from "@/utils/functions";
import drawCorrelationMatrix from "./CorrelationMatrix";
import styles from "@/utils/Charts.module.css";

const { Option } = Select;

export default function Correlation({ remove }) {
  const ref = useRef(null);

  const [config, setConfig] = useState({});

  const [params, setParams] = useState({
    groupVar: null,
    variables: [],
  });

  return (
    <div ref={ref} className={styles.viewContainer}>
      <ChartBar
        title={`Correlation Matrix`}
        infoTooltip={"test"}
        svgIds={["corr-matrix", "corr-legend"]}
        remove={remove}
      >
        <Options
          config={config}
          setConfig={setConfig}
          params={params}
          setParams={setParams}
        />
      </ChartBar>

      <CorrChart
        config={config}
        params={params}
        drawChart={drawCorrelationMatrix}
        getChartData={getCorrelationData}
      />
    </div>
  );
}

function Options({ config, setConfig, params, setParams }) {
  const navioColumns = useSelector(
    (state) => state.dataframe.navioColumns || []
  );

  const onVariablesChange = (values) => {
    setParams((prev) => ({
      ...prev,
      variables: values,
    }));
  };

  return (
    <Form layout="vertical" style={{ maxWidth: 500 }}>
      <Form.Item label={<>Variables to show </>}>
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
    </Form>
  );
}
