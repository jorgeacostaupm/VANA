import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Select, Slider, Space, Typography } from "antd";

import { getCategoricalKeys } from "@/utils/functions";

const { Option } = Select;
const { Text } = Typography;

export default function Settings({ config, setConfig, params, setParams }) {
  const data = useSelector((state) => state.dataframe.present.selection || []);
  const navioColumns = useSelector(
    (state) => state.dataframe.present.navioColumns || []
  );

  const update = (field, value) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  const categoricalVars = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return getCategoricalKeys(data);
  }, [data]);

  useEffect(() => {
    if (
      categoricalVars.length > 0 &&
      !categoricalVars.includes(params.groupVar)
    ) {
      update("groupVar", categoricalVars[0]);
    }
  }, [categoricalVars, params.groupVar, setConfig]);

  const onVariablesChange = (values) => {
    setParams((prev) => ({
      ...prev,
      variables: values,
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
        <Text strong>Grouping variable</Text>
        <Select
          value={config.groupVar}
          onChange={(v) => update("groupVar", v)}
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

      <Text strong>Included Variables</Text>
      <Select
        mode="multiple"
        value={params.variables}
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
        defaultValue={config.pointSize}
        onChangeComplete={(v) => update("pointSize", v)}
        style={{ width: "100%" }}
      />
    </Space>
  );
}
