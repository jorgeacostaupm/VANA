// SelectorPanel.jsx
import React from "react";
import { Select, Tooltip, Tag, Button } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
const { Option } = Select;
import tests from "@/utils/tests";

import AppBar from "@/utils/AppBar";
import styles from "@/utils/Buttons.module.css";
import { selectVars } from "../../VAPUtils/features/cantab/cantabSlice";

const color = "#7bb2ff";
const iconStyle = { fontSize: "25px" };

export function Variable({ onChange, generateDistribution, assumptions }) {
  const variables = useSelector(selectVars);
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const varTypes = useSelector((s) => s.cantab.varTypes);
  const allNormal = assumptions.normality?.every((d) => d.normal);

  const type = selectedVar ? varTypes[selectedVar] : null;
  const typeColor =
    type === VariableTypes.NUMERICAL
      ? "blue"
      : type === VariableTypes.CATEGORICAL
      ? "orange"
      : "pink";

  const grayStyle = {
    fontSize: 16,
    padding: "4px 10px",
    backgroundColor: "#f0f0f0",
    color: "#888",
  };

  return (
    <div
      style={{
        border: "3px solid white",
        borderRadius: 8,
        padding: "16px 20px",
        backgroundColor: color,
        display: "flex",
        gap: 8,
        minWidth: 400,
        alignItems: "center",
      }}
    >
      <Select
        value={selectedVar}
        onChange={onChange}
        placeholder="Select variable"
        style={{ width: "200px" }}
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
          icon={<AreaChartOutlined style={iconStyle} />}
          onClick={() => selectedVar && generateDistribution()}
          disabled={!selectedVar}
        />
      </Tooltip>

      {selectedVar ? (
        <Tooltip
          title={
            allNormal
              ? "All distributions meet normality"
              : "Some distributions fail normality"
          }
        >
          <Tag
            icon={
              allNormal ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )
            }
            color={allNormal ? "success" : "warning"}
            style={{ fontSize: 16, padding: "4px 10px" }}
          >
            Normality
          </Tag>
        </Tooltip>
      ) : (
        <Tag style={grayStyle}>-</Tag>
      )}

      {selectedVar ? (
        <Tooltip
          title={
            assumptions.equalVariance
              ? "Homogeneous variances"
              : "Heterogeneous variances"
          }
        >
          <Tag
            icon={
              assumptions.equalVariance ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )
            }
            color={assumptions.equalVariance ? "success" : "warning"}
            style={{ fontSize: 16, padding: "4px 10px" }}
          >
            Equal σ²
          </Tag>
        </Tooltip>
      ) : (
        <Tag style={grayStyle}>-</Tag>
      )}

      {selectedVar ? (
        <Tooltip title={`Variable type: ${type}`}>
          <Tag color={typeColor} style={{ fontSize: 16, padding: "4px 10px" }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Tag>
        </Tooltip>
      ) : (
        <Tag style={grayStyle}>-</Tag>
      )}
    </div>
  );
}

import { ExperimentOutlined, BarChartOutlined } from "@ant-design/icons";
import { VariableTypes } from "../../../utils/Constants";

function TestSelector({ onChange, generateTest, generateRanking }) {
  const selectedVar = useSelector((s) => s.compare.selectedVar);
  const selectedTest = useSelector((s) => s.compare.selectedTest);
  const varTypes = useSelector((s) => s.cantab.varTypes);
  const groups = useSelector((s) => s.cantab.selectionGroups);

  function triggerTest() {
    const testObj = tests.find((t) => t.label === selectedTest);
    const testType = testObj.variableType;
    const variableType = varTypes[selectedVar];
    console.log(testType, variableType, varTypes);
    if (testType === variableType && testObj.isApplicable(groups.length))
      generateTest();
    else console.log("BAD");
  }

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
        value={selectedTest}
        onChange={onChange}
        placeholder="Select test"
        style={{ width: "250px" }}
        size="large"
      >
        {tests.map((t) => (
          <Option key={t.label} value={t.label}>
            {t.label}
          </Option>
        ))}
      </Select>

      <Tooltip title="Run the selected test on current variable">
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<ExperimentOutlined style={iconStyle} />}
          onClick={triggerTest}
          disabled={!selectedVar || !selectedTest}
        />
      </Tooltip>

      <Tooltip title="Compare all variables with the selected test">
        <Button
          size="large"
          shape="circle"
          className={styles.coloredButton}
          icon={<BarChartOutlined style={iconStyle} />}
          onClick={() => selectedTest && generateRanking()}
          disabled={!selectedTest}
        />
      </Tooltip>
    </div>
  );
}

export default function Panel(props) {
  const {
    onVarChange,
    onTestChange,
    assumptions,
    generateDistribution,
    generateTest,
    generateRanking,
  } = props;

  return (
    <AppBar title="COMPARISON">
      <Variable
        onChange={onVarChange}
        generateDistribution={generateDistribution}
        assumptions={assumptions}
      />

      <TestSelector
        onChange={onTestChange}
        generateTest={generateTest}
        generateRanking={generateRanking}
      />
    </AppBar>
  );
}
