import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Divider, Button, Space, Tag } from "antd";
import { DiffOutlined, SisternodeOutlined } from "@ant-design/icons";
import * as aq from "arquero";
import DragDropHierarchy from "../DragDrop/DragDropHierarchy";
import {
  selectNumericNodes,
  selectTextNodes,
  selectDetermineNodes,
  selectAggregationNodes,
} from "@/store/selectors/metaSelectors";
import { addAttribute, removeAttribute } from "@/store/async/metaAsyncReducers";
import { getRandomInt } from "@/utils/functions";
import { HIDDEN_VARIABLES, VariableTypes } from "@/utils/Constants";
import { pubsub } from "@/utils/pubsub";

const { Title, Text } = Typography;
const { publish } = pubsub;

const formatPreview = (arr, max = 12) => {
  if (!arr || arr.length === 0) return "—";
  const preview = arr.slice(0, max);
  const remaining = arr.length - preview.length;
  return remaining > 0
    ? `${preview.join(", ")} (+${remaining} more)`
    : preview.join(", ");
};

const getDataframeVariables = (dataframe) => {
  if (!Array.isArray(dataframe) || dataframe.length === 0) return [];
  return aq
    .from(dataframe)
    .columnNames()
    .filter((column) => !HIDDEN_VARIABLES.includes(column));
};

const mapVarTypeToNodeDtype = (varType) => {
  if (!varType || varType === VariableTypes.UNKNOWN) {
    return "determine";
  }
  return varType;
};

const SyncPanel = () => {
  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.present.dataframe);
  const hierarchy = useSelector((state) => state.metadata.attributes);
  const varTypes = useSelector((state) => state.cantab.present.varTypes || {});
  const [actionLoading, setActionLoading] = useState(null);

  const {
    datasetVars,
    missingVars,
    extraAttributeNodes,
    extraAggregationNodes,
    hierarchyNodeNames,
    hasRootNode,
  } = useMemo(() => {
    const datasetVars = getDataframeVariables(dataframe);
    const hierarchyNodes = (hierarchy || []).filter((n) => n.type !== "root");
    const hasRootNode = (hierarchy || []).some(
      (n) => n.type === "root" && n.id === 0,
    );
    const hierarchyNodeNames = [...new Set(hierarchyNodes.map((n) => n.name))];
    const missingVars = datasetVars.filter(
      (varName) => !hierarchyNodeNames.includes(varName),
    );

    return {
      datasetVars,
      hierarchyNodeNames,
      hasRootNode,
      missingVars,
      extraAttributeNodes: hierarchyNodes.filter(
        (node) => node.type === "attribute" && !datasetVars.includes(node.name),
      ),
      extraAggregationNodes: hierarchyNodes.filter(
        (node) =>
          node.type === "aggregation" && !datasetVars.includes(node.name),
      ),
    };
  }, [dataframe, hierarchy]);

  const hasDataset = datasetVars.length > 0;
  const isCoordinated =
    hasDataset &&
    missingVars.length === 0 &&
    extraAttributeNodes.length === 0 &&
    extraAggregationNodes.length === 0;

  const handleAddMissingNodes = useCallback(async () => {
    if (missingVars.length === 0) {
      publish("notification", {
        message: "No missing nodes",
        description: "Hierarchy already contains all dataset variables.",
        type: "info",
      });
      return;
    }

    if (!hasRootNode) {
      publish("notification", {
        message: "Cannot add missing nodes",
        description:
          "The hierarchy root node (id: 0, type: root) is missing. Upload a valid hierarchy first.",
        type: "error",
      });
      return;
    }

    setActionLoading("add");
    const added = [];
    const failed = [];

    for (const varName of missingVars) {
      try {
        await dispatch(
          addAttribute({
            parentID: 0,
            id: getRandomInt(),
            name: varName,
            type: "attribute",
            dtype: mapVarTypeToNodeDtype(varTypes[varName]),
          }),
        ).unwrap();
        added.push(varName);
      } catch {
        failed.push(varName);
      }
    }

    setActionLoading(null);

    publish("notification", {
      message:
        failed.length === 0
          ? "Missing nodes added"
          : "Missing nodes added with warnings",
      description: [
        added.length > 0 ? `Added (${added.length}): ${formatPreview(added)}` : "",
        failed.length > 0
          ? `Failed (${failed.length}): ${formatPreview(failed)}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
      type: failed.length === 0 ? "success" : "warning",
      pauseOnHover: true,
      duration: 5,
    });
  }, [dispatch, hasRootNode, missingVars, varTypes]);

  const handleRemoveExtraNodes = useCallback(async () => {
    if (extraAttributeNodes.length === 0) {
      publish("notification", {
        message: "No removable extra nodes",
        description:
          "There are no extra attribute nodes. Aggregations are not removed automatically.",
        type: "info",
      });
      return;
    }

    setActionLoading("remove");
    const removed = [];
    const failed = [];

    for (const node of extraAttributeNodes) {
      try {
        await dispatch(
          removeAttribute({
            attributeID: node.id,
            recover: true,
          }),
        ).unwrap();
        removed.push(node.name);
      } catch {
        failed.push(node.name);
      }
    }

    setActionLoading(null);

    publish("notification", {
      message:
        failed.length === 0
          ? "Extra attribute nodes removed"
          : "Extra node cleanup completed with warnings",
      description: [
        removed.length > 0
          ? `Removed (${removed.length}): ${formatPreview(removed)}`
          : "",
        failed.length > 0
          ? `Failed (${failed.length}): ${formatPreview(failed)}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
      type: failed.length === 0 ? "success" : "warning",
      pauseOnHover: true,
      duration: 5,
    });
  }, [dispatch, extraAttributeNodes]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Status:
        </Text>
        <Tag color={isCoordinated ? "success" : "warning"}>
          {isCoordinated ? "Coordinated" : "Needs review"}
        </Tag>
      </div>

      {!hasDataset ? (
        <Text type="secondary">
          Upload data first to evaluate missing and extra hierarchy nodes.
        </Text>
      ) : (
        <>
          <Text type="secondary">
            Dataset vars: {datasetVars.length} | Hierarchy nodes:{" "}
            {hierarchyNodeNames.length}
          </Text>
          <Text type="secondary">
            Missing in hierarchy: {missingVars.length}
          </Text>
          <Text type="secondary">
            Extra attributes: {extraAttributeNodes.length}
          </Text>
          <Text type="secondary">
            Extra aggregations: {extraAggregationNodes.length}
          </Text>

          {missingVars.length > 0 ? (
            <Text type="secondary">
              Missing nodes: {formatPreview(missingVars)}
            </Text>
          ) : null}

          {extraAttributeNodes.length > 0 ? (
            <Text type="secondary">
              Extra attributes:{" "}
              {formatPreview(extraAttributeNodes.map((node) => node.name))}
            </Text>
          ) : null}

          {extraAggregationNodes.length > 0 ? (
            <Text type="secondary">
              Extra aggregations:{" "}
              {formatPreview(extraAggregationNodes.map((node) => node.name))}
            </Text>
          ) : null}

          <Space wrap>
            <Button
              icon={<DiffOutlined />}
              onClick={handleAddMissingNodes}
              loading={actionLoading === "add"}
              disabled={missingVars.length === 0 || actionLoading != null}
            >
              Add Missing Nodes
            </Button>
            <Button
              icon={<SisternodeOutlined />}
              onClick={handleRemoveExtraNodes}
              loading={actionLoading === "remove"}
              disabled={
                extraAttributeNodes.length === 0 || actionLoading != null
              }
            >
              Remove Extra Nodes
            </Button>
          </Space>
        </>
      )}
    </div>
  );
};

const Info = () => {
  const filename = useSelector((state) => state.metadata.filename);
  const dt = useSelector((state) => state.metadata.attributes);
  const numericNodes = useSelector((state) => selectNumericNodes(state));
  const textNodes = useSelector((state) => selectTextNodes(state));
  const determineNodes = useSelector((state) => selectDetermineNodes(state));
  const aggregationNodes = useSelector((state) =>
    selectAggregationNodes(state),
  );

  return (
    <div
      style={{
        display: "flex",
        width: "50%",
        flexDirection: "column",
        gap: "1rem",
        padding: "20px",
        boxSizing: "border-box",
        borderRadius: "4px",
        overflow: "auto",
      }}
    >
      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Metadata
      </Title>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          File Name:
        </Text>{" "}
        <Text>{filename ? filename : "—"}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Nodes:
        </Text>{" "}
        <Text>
          {dt?.length - aggregationNodes?.length || 0} original,{" "}
          {aggregationNodes?.length || 0} new
        </Text>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Summary
      </Title>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Numeric Measurements:
        </Text>{" "}
        <Text>{numericNodes?.length || 0}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Text Measurements:
        </Text>{" "}
        <Text>{textNodes?.length || 0}</Text>
      </div>

      <div>
        <Text strong style={{ color: "var(--primary-color)" }}>
          Nº Unknown Measurements:
        </Text>{" "}
        <Text>{determineNodes?.length || 0}</Text>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Expected File
      </Title>
      <div>
        <Text type="secondary">
          Upload a JSON array of hierarchy measurements. Each measurement should
          include the fields `id`, `name`, `type`, `dtype`, `related`, and
          `isShown`.
        </Text>
      </div>
      <div>
        <Text type="secondary">
          `related` is a list of child measurement IDs. The root measurement
          must have `id: 0` and `type: &quot;root&quot;`.
        </Text>
      </div>
      <div>
        <Text type="secondary">
          Aggregation measurements may include `info.exec` (formula) and should
          match existing data measurements by `name`.
        </Text>
      </div>
    </div>
  );
};

const UploadPanel = () => {
  return (
    <div
      style={{
        width: "50%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "1rem",
        borderLeft: "1px solid #eee",
        padding: "20px",
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <Title
        level={4}
        style={{ marginBottom: 0, color: "var(--primary-color)" }}
      >
        Upload Hierarchy
      </Title>
      <Text type="secondary">
        This replaces the current hierarchy and updates the visible measurements.
      </Text>
      <DragDropHierarchy />

      <Divider style={{ margin: "1rem 0" }} />

      <Title level={4} style={{ marginTop: 0, color: "var(--primary-color)" }}>
        Hierarchy/Data Sync
      </Title>
      <SyncPanel />
    </div>
  );
};

export default function TabHierarchy() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: "1rem",
        overflow: "auto",
      }}
    >
      <Info />
      <UploadPanel />
    </div>
  );
}
