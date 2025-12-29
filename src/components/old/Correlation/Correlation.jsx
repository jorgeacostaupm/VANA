import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Typography, Space } from "antd";
import CorrChart from "./CorrChart";
import { generateId, getCorrelationData } from "@/utils/functions";
import drawCorrelationMatrix from "./CorrelationMatrix";
const { Text } = Typography;
const { Option } = Select;

import ViewContainer from "../../../utils/ViewContainer";

export default function Correlation({ remove }) {
  const [config, setConfig] = useState({
    isSync: true,
  });
  const [params, setParams] = useState({
    groupVar: null,
    variables: [],
  });

  const chart = useMemo(() => {
    return (
      <CorrChart
        config={config}
        params={params}
        drawChart={drawCorrelationMatrix}
        getChartData={getCorrelationData}
        id={id}
      />
    );
  }, [config, params]);

  return (
    <ViewContainer
      title={`Correlation Matrix`}
      svgIDs={[id, `${id}-legend`]}
      remove={remove}
      settings={
        <Settings
          config={config}
          setConfig={setConfig}
          params={params}
          setParams={setParams}
        />
      }
      chart={chart}
      config={config}
      setConfig={setConfig}
    />
  );
}

function Settings({ config, setConfig, params, setParams }) {
  const navioColumns = useSelector(
    (state) => state.dataframe.present.navioColumns || []
  );

  const onVariablesChange = (values) => {
    setParams((prev) => ({
      ...prev,
      variables: values,
    }));
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "400px" }}>
      <Text strong>Included Variables</Text>
      <Select
        mode="multiple"
        value={params.variables}
        onChange={onVariablesChange}
        placeholder=""
        style={{ width: "100%", maxWidth: "400px" }}
        disabled={!config.isSync}
      >
        {navioColumns.map((key) => (
          <Option key={key} value={key}>
            {key}
          </Option>
        ))}
      </Select>
    </Space>
  );
}
