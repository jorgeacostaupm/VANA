// SelectorPanel.jsx
import React from "react";
import { Select, Tooltip, Tag, Button } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import tests from "@/utils/evolution_tests";
const { Option } = Select;

import AppBar from "@/utils/AppBar";
import styles from "@/utils/Buttons.module.css";

const color = "#7bb2ff";
const iconStyle = { fontSize: "25px" }; // Ajusta a tu gusto

function Variable({ variables, selectedVar, onChange, generateEvolution }) {
  return (
    <div
      style={{
        border: "3px solid white",
        borderRadius: 8,
        padding: "16px 20px",
        backgroundColor: color,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <Select
        value={selectedVar}
        onChange={onChange}
        placeholder="Select variable"
        style={{ width: "150px" }}
        size="large"
      >
        {variables.map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <Tooltip title={"Add distribution plots for the selected variable"}>
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<LineChartOutlined style={iconStyle} />}
          onClick={() => selectedVar && generateEvolution()}
        />
      </Tooltip>
    </div>
  );
}

import { ExperimentOutlined, BarChartOutlined } from "@ant-design/icons"; // puedes cambiar estos si prefieres otros íconos

function TestSelector({ selectedTest, onChange, generateRanking }) {
  return (
    <div
      style={{
        border: "3px solid white",
        borderRadius: 8,
        padding: "16px 20px",
        backgroundColor: color,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <Select
        onChange={onChange}
        placeholder="Select test"
        style={{ width: "150px" }}
        size="large"
      >
        {tests.map((t) => (
          <Option key={t.label} value={t.label}>
            {t.label}
          </Option>
        ))}
      </Select>

      <Tooltip title="Compare all variables with the selected test">
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<BarChartOutlined style={iconStyle} />}
          onClick={() => selectedTest && generateRanking()}
        />
      </Tooltip>
    </div>
  );
}

export default function Panel(props) {
  const {
    variables,
    selectedVar,
    selectedTest,
    onVarChange,
    onTestChange,
    generateEvolution,
    generateRanking,
  } = props;

  return (
    <AppBar title="EVOLUTION APP">
      <Variable
        variables={variables}
        selectedVar={selectedVar}
        onChange={onVarChange}
        generateEvolution={generateEvolution}
      />
      <TestSelector
        selectedTest={selectedTest}
        onChange={onTestChange}
        generateRanking={generateRanking}
      />
    </AppBar>
  );
}
