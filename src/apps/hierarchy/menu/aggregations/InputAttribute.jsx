import { Field } from "formik";
import { motion } from "framer-motion";
import { HorizontalDropIndicator as DropIndicator } from "./DropIndicator";
import { InputNumber } from "antd";
import { useFormikContext } from "formik";

const InputAttribute = ({ idx, node, onDragStart, isHidden = false }) => {
  const { setFieldValue } = useFormikContext();
  const handleChange = (value) => {
    setFieldValue(`info.usedAttributes.${idx}.weight`, value);
  };
  return (
    <>
      <div
        style={{
          display: isHidden ? "none" : "block",
          width: "95%",
          alignSelf: "center",
          justifySelf: "center",
        }}
      >
        <DropIndicator used={`${node.used}`} nodeID={node.id} />
        <motion.div
          layout
          layoutId={node.id}
          id={`info.usedAttributes.${idx}`}
          draggable={true}
          onDragStart={(e) => onDragStart(e, { id: node.id, name: node.name })}
          style={{
            display: "flex",
            cursor: "grab",
            padding: "0.5rem",
            border: "1px solid",
            borderRadius: "0.75rem",
            background: "transparent",
            overflow: "hidden",
            width: "100%",
            flexDirection: "column",
          }}
        >
          <Field
            as="div"
            id={`info.usedAttributes.${idx}.name`}
            name={`info.usedAttributes.${idx}.name`}
            title={node.name}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
            }}
          >
            {node.name}
          </Field>
          <div
            style={{
              display: "flex",
              overflow: "hidden",
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <div>W:</div>
            <InputNumber
              id={`info.usedAttributes.${idx}.weight`}
              name={`info.usedAttributes.${idx}.weight`}
              style={{
                textOverflow: "ellipsis",
                textAlign: "center",
                borderRadius: "5px",
              }}
              min={-Infinity}
              max={Infinity}
              defaultValue={1}
              step={1}
              onChange={handleChange}
            />
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default InputAttribute;
