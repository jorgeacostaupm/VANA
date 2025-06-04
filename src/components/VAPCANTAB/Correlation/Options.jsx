import React from "react";
import {
  setColumns,
  setIsOnlyCorrelations,
  setNVariables,
  setPointsSize,
} from "@/components/VAPUtils/features/correlation/correlationSlice";
import { useSelector, useDispatch } from "react-redux";
import {
  Checkbox,
  Button,
  Slider,
  Typography,
  Card,
  Space,
  Divider,
  Switch,
  Col,
} from "antd";
import { SlidersOutlined, DotChartOutlined } from "@ant-design/icons";
import { computeCorrelationMatrixData } from "@/components/VAPUtils/functions";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Options = () => {
  const dispatch = useDispatch();

  const isOnlyCorrelations = useSelector(
    (state) => state.correlation.isOnlyCorrelations
  );
  const nVariables = useSelector((state) => state.correlation.nVariables);
  const selection = useSelector((state) => state.cantab.selection);
  const navioColumns = useSelector((state) => state.dataframe.navioColumns);
  const points_size = useSelector((state) => state.correlation.points_size);
  const selectedPopulations = useSelector(
    (state) => state.correlation.selectedPopulations
  );
  const groupVar = useSelector((state) => state.cantab.groupVar);

  const onOnlyCorrelations = (e) => dispatch(setIsOnlyCorrelations(e));

  const onNVariablesComplete = (value) => dispatch(setNVariables(value));
  const onPointsSizeComplete = (value) => dispatch(setPointsSize(value));

  const getTopColumns = () => {
    const matrix = computeCorrelationMatrixData(
      selection,
      navioColumns,
      selectedPopulations,
      groupVar
    );

    const filtered = matrix
      .filter((d) => d.x !== d.y && !isNaN(d.value))
      .sort((a, b) => b.value - a.value);

    const topVars = [];
    const added = new Set();

    for (let i = 0; i < filtered.length && topVars.length < nVariables; i++) {
      const { x, y } = filtered[i];
      if (!added.has(x)) {
        topVars.push(x);
        added.add(x);
      }
      if (!added.has(y) && topVars.length < nVariables) {
        topVars.push(y);
        added.add(y);
      }
    }

    dispatch(setColumns(topVars));
    return topVars;
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Col>
        <Switch
          checked={isOnlyCorrelations}
          onChange={onOnlyCorrelations}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.3s",
          }}
        />
        <Typography.Text
          strong
          type={!isOnlyCorrelations ? "secondary" : "primary"}
          style={{ marginLeft: 4 }}
        >
          {!isOnlyCorrelations
            ? "Only correlation values"
            : "Scatterplot/Correlation values"}
        </Typography.Text>
      </Col>

      <div>
        <Text strong>Nº Top Variables</Text>
        <Slider
          min={1}
          max={80}
          defaultValue={nVariables}
          onChangeComplete={onNVariablesComplete}
          step={1}
        />
      </div>

      <Button
        type="primary"
        icon={<DotChartOutlined />}
        onClick={getTopColumns}
        block
      >
        Get Top {nVariables} Variables
      </Button>

      <Divider style={{ margin: "12px 0" }} />

      <div>
        <Text strong>Points Size</Text>
        <Slider
          min={1}
          max={10}
          defaultValue={points_size}
          onChangeComplete={onPointsSizeComplete}
          step={1}
        />
      </div>
    </Space>
  );
};

export default Options;
