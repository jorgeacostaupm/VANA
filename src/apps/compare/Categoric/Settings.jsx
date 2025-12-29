import React from "react";
import { Typography, Space, Radio } from "antd";

const { Text } = Typography;

export default function Settings({ config, setConfig }) {
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
          value={config.chartType}
          onChange={(e) =>
            setConfig((prev) => ({
              ...prev,
              chartType: e.target.value,
            }))
          }
        >
          <Radio.Button value="stacked">Stacked Bars</Radio.Button>
          <Radio.Button value="grouped">Grouped Bars</Radio.Button>
        </Radio.Group>
      </div>
    </Space>
  );
}
