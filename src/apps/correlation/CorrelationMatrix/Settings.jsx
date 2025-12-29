import React from "react";
import { useSelector } from "react-redux";
import { Button, Select, Space, Typography, InputNumber, Slider } from "antd";
import { getTopCorrelations } from "@/utils/functionsCorrelation";
import { EditOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

export default function Settings({ config, setConfig, params, setParams }) {
  const data = useSelector((s) => s.dataframe.present.selection);
  const navioColumns = useSelector(
    (state) => state.dataframe.present.navioColumns || []
  );

  const onVariablesChange = (variables) => {
    setParams((prev) => ({
      ...prev,
      variables,
    }));
  };

  const onClick = () => {
    const nTop = params.nTop;
    const variables = getTopCorrelations(data, nTop);
    setParams((prev) => ({
      ...prev,
      variables,
    }));
  };

  const onChange = (nTop) => {
    setParams((prev) => ({
      ...prev,
      nTop,
    }));
  };

  const onRangeChange = (range) => {
    setConfig((prev) => ({
      ...prev,
      range,
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

      <Space align="center" size="middle">
        <Text strong>Get Top</Text>

        <InputNumber
          min={0}
          value={params.nTop}
          onChange={onChange}
          style={{ width: 120 }}
        />

        <Button type="primary" icon={<EditOutlined />} onClick={onClick} />
      </Space>

      <Space direction="vertical" style={{ width: "100%" }}>
        <Text strong>Correlation Range</Text>

        <Slider
          range
          min={0}
          max={1}
          step={0.01}
          value={config.range}
          onChange={onRangeChange}
          disabled={!config.isSync}
        />

        <Space>
          <Text type="secondary">
            {config.range[0].toFixed(2)} – {config.range[1].toFixed(2)}
          </Text>
        </Space>
      </Space>
    </Space>
  );
}
