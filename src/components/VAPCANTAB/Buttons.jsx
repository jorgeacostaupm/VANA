import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChartOutlined,
  ApartmentOutlined,
  DotChartOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  PartitionOutlined,
  BugOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import ButtonLink from "@/utils/ButtonLink";
import DataManagement from "./Data/DataManagement";
import { setInit as setInitMetadata } from "@/components/VAPUtils/features/metadata/metaSlice";
import { setInit as setInitCompare } from "@/components/VAPUtils/features/compare/compareSlice";
import { setInit as setInitEvolution } from "@/components/VAPUtils/features/evolution/evolutionSlice";
import { setInit as setInitCorrelation } from "@/components/VAPUtils/features/correlation/correlationSlice";
import { setInitQuarantine } from "../VAPUtils/features/cantab/cantabSlice";
import { Button, Tooltip } from "antd";
import buttonStyles from "@/utils/Buttons.module.css";

export default function Buttons({ createView }) {
  const dispatch = useDispatch();
  const initHierarchy = useSelector((state) => state.metadata.init);
  const initCompare = useSelector((state) => state.compare.init);
  const initEvolution = useSelector((state) => state.evolution.init);
  const initCorrelation = useSelector((state) => state.correlation.init);
  const initQuarantine = useSelector((state) => state.cantab.initQuarantine);

  const iconStyle = { fontSize: "40px" };

  function onQuarantine() {
    dispatch(setInitQuarantine(true));
    createView("quarantine");
  }

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <DataManagement></DataManagement>
      {!initHierarchy && (
        <ButtonLink
          to="metadata"
          setInit={setInitMetadata}
          icon={<PartitionOutlined style={iconStyle} />}
        />
      )}
      {!initCompare && (
        <ButtonLink
          to="compare"
          setInit={setInitCompare}
          icon={<BarChartOutlined style={iconStyle} />}
        />
      )}
      {!initEvolution && (
        <ButtonLink
          to="evolution"
          setInit={setInitEvolution}
          icon={<LineChartOutlined style={iconStyle} />}
        />
      )}
      {!initCorrelation && (
        <ButtonLink
          to="correlation"
          setInit={setInitCorrelation}
          icon={<DotChartOutlined style={iconStyle} />}
        />
      )}
      {!initQuarantine && (
        <Tooltip title={"Open Quarantine view"}>
          <Button
            style={{ height: "auto", padding: "20px" }}
            shape="circle"
            className={buttonStyles.coloredButton}
            onClick={onQuarantine}
          >
            <BugOutlined style={iconStyle} />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
