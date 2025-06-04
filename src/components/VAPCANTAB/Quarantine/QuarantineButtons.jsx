import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Select,
  Typography,
  Divider,
  Tooltip,
  Card,
  Button,
  Slider,
  Input,
} from "antd";
import {
  ExportOutlined,
  RollbackOutlined,
  EditOutlined,
} from "@ant-design/icons";

import { ColorScales } from "../Overview/OverviewButtons";
import { Settings } from "../Overview/OverviewButtons";

import {
  setDataframe,
  updateData,
} from "../../VAPUtils/features/data/dataSlice";
import {
  setAttrWidth,
  setQuarantineData,
  selectAllVars,
} from "../../VAPUtils/features/cantab/cantabSlice";

import buttonStyles from "@/utils/Buttons.module.css";
import barStyles from "@/utils/ChartBar.module.css";
import { generateFileName } from "@/utils/functions";
import { ORDER_VARIABLE } from "@/utils/Constants";

const { Text } = Typography;
const iconStyle = { fontSize: "20px" };

export default function QuarantineButtons() {
  return (
    <>
      <EditColumns />
      <RestoreData />
      <Export />
      <ColorScales />
      <Settings />
    </>
  );
}

function RestoreData() {
  const dispatch = useDispatch();
  const selection = useSelector((state) => state.cantab.quarantineSelection);
  const quarantineData = useSelector((state) => state.cantab.quarantineData);
  const dataframe = useSelector((state) => state.dataframe.dataframe);

  function resetQuarantineSelection() {
    const ids = selection.map((item) => item[ORDER_VARIABLE]);
    const filteredData = quarantineData.filter((item) =>
      ids.includes(item[ORDER_VARIABLE])
    );
    const filteredQuarantineData = quarantineData.filter(
      (item) => !ids.includes(item[ORDER_VARIABLE])
    );

    dispatch(updateData([...filteredData, ...dataframe]));
    dispatch(setQuarantineData(filteredQuarantineData));
  }

  return (
    <Tooltip title={"Send selection to Navio"}>
      <Button
        shape="circle"
        className={buttonStyles.coloredButton}
        onClick={resetQuarantineSelection}
      >
        <RollbackOutlined style={iconStyle} />
      </Button>
    </Tooltip>
  );
}

function EditColumns() {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const selection = useSelector((state) => state.cantab.quarantineSelection);
  const data = useSelector((state) => state.cantab.quarantineData);
  const [column, setColumn] = useState(null);
  const vars = useSelector(selectAllVars);
  const ids = selection?.map((item) => item[ORDER_VARIABLE]);

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

    dispatch(setQuarantineData(updatedData));
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Text style={{ color: "var(--primary-color)" }} strong>
                Select a column to edit
              </Text>
              <Select
                value={column}
                onChange={setColumn}
                placeholder="Select column"
                options={vars.map((key) => ({
                  label: key,
                  value: key,
                }))}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Text style={{ color: "var(--primary-color)" }} strong>
                New value
              </Text>
              <Input
                value={inputValue}
                onChange={onInputChange}
                placeholder="New group name"
              ></Input>
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
                  <EditOutlined style={iconStyle}></EditOutlined>
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

function ExportButtons() {
  const allData = useSelector((state) => state.dataframe.dataframe);
  const selectionData = useSelector((state) => state.cantab.selection);
  const navioColumns = useSelector((state) => state.dataframe.navioColumns);

  const convertToCSV = (array) => {
    const keys = navioColumns;
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
    <>
      <Button
        style={{
          border: "2px solid",
        }}
        className={buttonStyles.coloredButton}
        onClick={() => saveData2CSV(selectionData, "selection_data")}
      >
        Selection
      </Button>
      <Button
        style={{
          border: "2px solid",
        }}
        className={buttonStyles.coloredButton}
        onClick={() => saveData2CSV(allData, "all_data")}
      >
        All
      </Button>
    </>
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
            <ExportButtons></ExportButtons>
          </div>
        </Card>
      )}
    </>
  );
}
