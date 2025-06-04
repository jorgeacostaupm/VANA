import CustomMeasure from "./custom/CustomMeasure";

const NodeMeasureConfig = ({ aggOp, children, vals }) => {
  return (
    <CustomMeasure nodes={children} formula={vals.info.formula}></CustomMeasure>
  );
};

export default NodeMeasureConfig;
