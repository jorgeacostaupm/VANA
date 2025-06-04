import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as d3 from "d3";

import {
  Select,
  Typography,
  Tooltip,
  Card,
  Modal,
  Row,
  Col,
  Slider,
  Input,
  Button,
} from "antd";

import {
  EditOutlined,
  SettingOutlined,
  ExportOutlined,
  AimOutlined,
  RollbackOutlined,
  AlertOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";

import {
  setAttrWidth,
  selectAllVars,
  setQuarantineData,
  setFilteredData,
} from "@/components/VAPUtils/features/cantab/cantabSlice";

import {
  setDataframe,
  updateData,
} from "@/components/VAPUtils/features/data/dataSlice";

import { generateFileName } from "@/utils//functions";
import { ORDER_VARIABLE } from "@/utils//Constants";
import buttonStyles from "@/utils/Buttons.module.css";
import barStyles from "@/utils/ChartBar.module.css";

const { Text } = Typography;
const iconStyle = { fontSize: "20px" };

export default function OverviewButtons() {
  return (
    <>
      <EditColumns />
      <FixAndReset />
      <QuarantineButton />
      <Export />
      <ColorScales />
      <Settings />
    </>
  );
}

export function Settings() {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const attrWidth = useSelector((state) => state.cantab.attrWidth);

  const onSliderComplete = (value) => {
    dispatch(setAttrWidth(value));
  };

  return (
    <>
      <Tooltip title={"Chart configuration"}>
        <Button
          className={buttonStyles.coloredButton}
          shape="circle"
          icon={<SettingOutlined style={iconStyle} />}
          onClick={() => setIsVisible(!isVisible)}
        />
      </Tooltip>

      {isVisible && (
        <Card size="small" className={barStyles.options}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <Text style={{ color: "var(--primary-color)" }} strong>
              Attribute width {attrWidth}px
            </Text>
            <Slider
              min={15}
              max={50}
              defaultValue={attrWidth}
              onChangeComplete={onSliderComplete}
              step={1}
              style={{ width: "100%" }}
            />
          </div>
        </Card>
      )}
    </>
  );
}

export function ColorScales() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const colorScales = {
    "Numbers (from lowest to highest)": d3.scaleSequential(d3.interpolateBlues),
    Dates: d3.scaleSequential(d3.interpolatePurples),
    "Diverging Numbers (from negative to positive)": d3.scaleSequential(
      d3.interpolateBrBG
    ),
    Ordered: d3.scaleSequential(d3.interpolateOranges),
    Text: d3.scaleSequential(d3.interpolateGreys),
    Categories: d3.schemeCategory10,
  };

  const generateGradient = (scale, steps = 12) => {
    if (Array.isArray(scale)) return scale;
    return Array.from({ length: steps }, (_, i) => scale(i / (steps - 1)));
  };

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  return (
    <>
      <Tooltip title={"Color legend"}>
        <Button
          shape="circle"
          className={buttonStyles.coloredButton}
          onClick={showModal}
        >
          <BgColorsOutlined style={{ fontSize: "25px" }} />
        </Button>
      </Tooltip>
      <Modal
        title="Color Scales"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <div>
          {Object.entries(colorScales).map(([name, scale]) => (
            <div key={name} style={{ marginBottom: "20px" }}>
              <h4>{name}</h4>
              <Row gutter={[8, 8]}>
                {generateGradient(scale).map((color, index) => (
                  <Col key={index} span={2}>
                    <div
                      style={{
                        backgroundColor: color,
                        height: "20px",
                        width: "100%",
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}

function EditColumns() {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const selection = useSelector((state) => state.cantab.selection);
  const data = useSelector((state) => state.dataframe.dataframe);
  const filename = useSelector((state) => state.dataframe.filename);
  const groupVar = useSelector((state) => state.cantab.groupVar);
  const vars = useSelector(selectAllVars);

  const [column, setColumn] = useState(groupVar);
  const ids = selection.map((item) => item[ORDER_VARIABLE]);

  const onInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const onEditSelection = () => {
    const updatedData = data.map((item) => {
      if (ids.includes(item[ORDER_VARIABLE])) {
        return { ...item, [column]: inputValue };
      }
      return item;
    });

    dispatch(
      updateData({
        data: updatedData,
        isGenerateHierarchy: false,
        filename,
      })
    );
  };

  return (
    <>
      <Tooltip title={"Edit columns"}>
        <Button
          className={buttonStyles.coloredButton}
          shape="circle"
          icon={<EditOutlined style={iconStyle} />}
          onClick={() => setIsVisible(!isVisible)}
        />
      </Tooltip>

      {isVisible && (
        <Card size="small" className={barStyles.options}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text style={{ color: "var(--primary-color)" }} strong>
                Select a column to edit
              </Text>
              <Select
                value={column}
                onChange={setColumn}
                placeholder="Select column"
                options={vars.map((key) => ({ label: key, value: key }))}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text style={{ color: "var(--primary-color)" }} strong>
                New value
              </Text>
              <Input
                value={inputValue}
                onChange={onInputChange}
                placeholder="New group name"
              />
            </div>

            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <Tooltip
                placement="left"
                title={`Change selection ${column} values to ${inputValue}`}
              >
                <Button
                  shape="circle"
                  onClick={onEditSelection}
                  className={buttonStyles.coloredButton}
                  style={{
                    height: "auto",
                    padding: "10px",
                    border: "2px solid",
                  }}
                >
                  <EditOutlined style={iconStyle} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

function FixAndReset() {
  const dispatch = useDispatch();
  const selection = useSelector((state) => state.cantab.selection);
  const dataframe = useSelector((state) => state.dataframe.dataframe);
  const filteredData = useSelector((state) => state.cantab.filteredData);

  const onFilter = () => {
    const ids = selection.map((item) => item[ORDER_VARIABLE]);
    const newData = dataframe.filter(
      (item) => !ids.includes(item[ORDER_VARIABLE])
    );
    dispatch(setDataframe(selection));
    dispatch(setFilteredData(newData));
  };

  const onReset = () => {
    dispatch(setDataframe([...filteredData, ...dataframe]));
  };

  return (
    <>
      <Tooltip title={"Restore original data"}>
        <Button
          shape="circle"
          className={buttonStyles.coloredButton}
          onClick={onReset}
        >
          <RollbackOutlined style={iconStyle} />
        </Button>
      </Tooltip>

      <Tooltip title={"Fix selection"}>
        <Button
          shape="circle"
          className={buttonStyles.coloredButton}
          onClick={onFilter}
        >
          <AimOutlined style={iconStyle} />
        </Button>
      </Tooltip>
    </>
  );
}

function QuarantineButton() {
  const dispatch = useDispatch();
  const selection = useSelector((state) => state.cantab.selection);
  const data = useSelector((state) => state.dataframe.dataframe);
  const qData = useSelector((state) => state.cantab.quarantineData);
  const ids = selection.map((item) => item[ORDER_VARIABLE]);

  const onQuarantine = () => {
    const newData = data.filter((item) => !ids.includes(item[ORDER_VARIABLE]));
    dispatch(setDataframe(newData));
    dispatch(setQuarantineData([...qData, ...selection]));
  };

  return (
    <Tooltip title={"Send selection to Quarantine view"}>
      <Button
        shape="circle"
        className={buttonStyles.coloredButton}
        onClick={onQuarantine}
      >
        <AlertOutlined style={{ fontSize: "25px" }} />
      </Button>
    </Tooltip>
  );
}

function ExportButtons() {
  const allData = useSelector((state) => state.dataframe.dataframe);
  const selectionData = useSelector((state) => state.cantab.selection);
  const variables = useSelector(selectAllVars);

  const convertToCSV = (array) => {
    const keys = variables;
    const csvRows = [keys.join(",")];

    array.forEach((obj) => {
      const values = keys.map((key) => obj[key]);
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  const saveData2CSV = (data, name) => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: "text/csv" });
    const href = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = href;
    downloadLink.download = generateFileName(name);
    downloadLink.click();
  };

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      <Button
        style={{ border: "2px solid" }}
        className={buttonStyles.coloredButton}
        onClick={() => saveData2CSV(selectionData, "selection_data")}
      >
        Selection
      </Button>
      <Button
        style={{ border: "2px solid" }}
        className={buttonStyles.coloredButton}
        onClick={() => saveData2CSV(allData, "all_data")}
      >
        All
      </Button>
    </div>
  );
}

function Export() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Tooltip title={"Export data"}>
        <Button
          className={buttonStyles.coloredButton}
          shape="circle"
          icon={<ExportOutlined style={iconStyle} />}
          onClick={() => setIsVisible(!isVisible)}
        />
      </Tooltip>

      {isVisible && (
        <Card size="small" className={barStyles.options}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              alignItems: "center",
            }}
          >
            <ExportButtons />
          </div>
        </Card>
      )}
    </>
  );
}
