import { useState, useRef, useEffect } from "react";
import { pubsub } from "@/components/VAPUtils/pubsub";
import { Formik, Form, useFormikContext, useField } from "formik";
import { Input, Typography, Button, Tooltip } from "antd";
import NodeInfo from "./NodeInfo";
import NodeAggregationConfig from "./NodeAggregationConfig";
import NodeMeasureConfig from "./NodeMeasureConfig";
import { updateAttribute } from "@/components/VAPUtils/features/metadata/metaCreatorReducer";
import { renameColumn } from "@/components/VAPUtils/features/data/dataSlice";
import { useDispatch } from "react-redux";
import { NodeSchema } from "./NodeValidation";
import { NodeBar } from "@/utils/ChartBar";
import styles from "@/utils//Charts.module.css";
import buttonStyles from "@/utils//Buttons.module.css";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
const { Text } = Typography;

function areObjectsEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every((key) => obj1[key] === obj2[key]);
}

function wasTouched(initial, newOb) {
  if (initial.id !== newOb.id) {
    throw "They are different nodes";
  }

  let ret = {};
  ret["name"] = initial["name"] === newOb["name"];
  ret["desc"] = initial["desc"] === newOb["desc"];
  ret["type"] = initial["type"] === newOb["type"];
  ret["dtype"] = initial["dtype"] === newOb["dtype"];
  ret["related"] = initial["related"].length === newOb["related"].length;

  ret["info"] = true;
  if (initial["type"] === "aggregation") {
    ret["info"] = areObjectsEqual(initial["info"], newOb["info"]);
  }

  return ret;
}

const NodeMenu = ({ nodeInfo }) => {
  const [node, setNode] = useState(null);
  const [nodeId, setNodeId] = useState(null);
  const [openMenu, toggleMenu] = useState(false);

  const { publish, subscribe } = pubsub;
  const dispatch = useDispatch();

  const formRef = useRef(null);
  const resizeRef = useRef();

  useEffect(() => {
    setNode(() => nodeInfo.find((n) => n.id === nodeId));
  }, [nodeInfo]);

  subscribe("nodeInspectionNode", ({ nodeId }) => {
    setNode(() => nodeInfo.find((n) => n.id === nodeId));
    setNodeId(nodeId);
    toggleMenu(nodeId != null);
  });

  subscribe("toggleInspectMenu", () => {
    toggleMenu((prev) => !prev);
  });

  subscribe("untoggleEvent", () => {
    toggleMenu(false);
  });

  useEffect(() => {
    const handleUnload = () => {
      formRef.current?.handleSubmit();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  if (node == null) {
    return;
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onSubmit = async (values) => {
    console.log(node, values);
    const touchFields = wasTouched(node, values);
    if (!touchFields["name"]) {
      publish("modifyNodeInfo", { node: values });
      if (node.id !== 0) {
        dispatch(
          renameColumn({ prevName: node["name"], newName: values["name"] })
        );
      }
      await sleep(250); // para evitar condición de carrera con el renombre si lo hubo
    }
    dispatch(updateAttribute({ ...values, recover: true }));
  };

  const availableNodes = node.related
    .map((i) => {
      const n = nodeInfo.find((n) => n.id === i);
      if (n == null) return null;
      const isUsed =
        node.info && node.info.usedAttributes.some((u) => u.id === n.id);
      return { id: n.id, name: n.name, weight: 1, used: isUsed };
    })
    .filter((n) => n != null);

  const closeTab = () => toggleMenu((prev) => !prev);

  const getItems = (values) => {
    const items = [
      values.type === "aggregation" && {
        key: 2,
        label: "Aggregation",
        children:
          availableNodes.length === 0 ? (
            <NodeMeasureConfig
              children={nodeInfo.filter((n) => n.id !== 0)}
              vals={values}
            />
          ) : (
            <NodeAggregationConfig
              aggOp={values.info.operation || "sum"}
              children={availableNodes}
              vals={values}
            />
          ),
      },
    ];

    return items.filter(Boolean);
  };

  return (
    openMenu && (
      <div className={styles.nodeInfo}>
        <NodeBar title={"Node Menu"} remove={closeTab}></NodeBar>
        <Formik
          innerRef={formRef}
          initialValues={node}
          onSubmit={onSubmit}
          validationSchema={NodeSchema}
          enableReinitialize={true}
        >
          {({ values }) => (
            <Form
              ref={resizeRef}
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <NodeName />

              <NodeInfo
                nChildren={availableNodes.length}
                nodeType={node.type == null ? "root" : node.type}
                nodeId={node.id}
                DType={node.dtype}
                height={node.height}
              />
              <NodeDescriptionField />
              {values.type === "aggregation" ? (
                availableNodes.length === 0 ? (
                  <NodeMeasureConfig
                    children={nodeInfo.filter((n) => n.id !== 0)}
                    vals={values}
                  />
                ) : (
                  <NodeAggregationConfig
                    aggOp={values.info.operation || "sum"}
                    children={availableNodes}
                    vals={values}
                  />
                )
              ) : null}
              <SaveButton></SaveButton>
            </Form>
          )}
        </Formik>
      </div>
    )
  );
};

export default NodeMenu;

function SaveButton() {
  const { isValid, errors } = useFormikContext();

  return (
    <div style={{ justifyContent: "center", display: "flex", marginTop: 10 }}>
      <Tooltip title="Save">
        <Button
          shape="circle"
          className={buttonStyles.coloredButton}
          style={{
            height: "auto",
            padding: "10px",
            border: "2px solid",
          }}
          htmlType="submit"
          disabled={!isValid}
          onClick={() => isValid}
        >
          <SaveOutlined style={{ fontSize: "20px" }} />
        </Button>
      </Tooltip>
    </div>
  );
}

const NodeName = () => {
  const [field] = useField("name");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <Text style={{ color: "var(--primary-color)" }} strong>
        Name:
      </Text>
      <Input
        id="name"
        {...field}
        style={{
          padding: "5px",
          width: "150px",
        }}
      />
    </div>
  );
};

function NodeDescriptionField() {
  const [field, meta, helpers] = useField("desc");

  function onChange(e) {
    const value = e.target.value;
    helpers.setValue(value);
    console.log(value);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Text style={{ color: "var(--primary-color)" }} strong>
        Description:
      </Text>
      <Input.TextArea
        id="desc"
        {...field}
        rows={4}
        onChange={onChange}
        value={field.value}
      />
    </div>
  );
}
