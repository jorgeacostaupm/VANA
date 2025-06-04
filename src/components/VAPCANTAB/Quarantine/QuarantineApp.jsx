import React from "react";
import { Button, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { CloseOutlined } from "@ant-design/icons";

import Quarantine from "./Quarantine";
import QuarantineButtons from "./QuarantineButtons";

import { Bar } from "@/utils/ChartBar";
import styles from "@/utils/Charts.module.css";
import { setInitQuarantine } from "../../VAPUtils/features/cantab/cantabSlice";
import buttonStyles from "@/utils/Buttons.module.css";

export default function QuarantineApp({ removeView }) {
  const dt = useSelector((state) => state.cantab.quarantineData);
  return (
    <div className={styles.viewContainer}>
      <Bar title={"Quarantine"}>
        <QuarantineButtons></QuarantineButtons>
        <CloseButton removeView={removeView}></CloseButton>
      </Bar>

      <Quarantine />
    </div>
  );
}

const iconStyle = { fontSize: "20px" };

function CloseButton({ removeView }) {
  const dispatch = useDispatch();

  function onClick() {
    removeView();
    dispatch(setInitQuarantine(false));
  }

  return (
    <Tooltip title={"Close chart"}>
      <Button
        className={buttonStyles.coloredButton}
        shape="circle"
        icon={<CloseOutlined style={iconStyle} />}
        onClick={onClick}
      />
    </Tooltip>
  );
}
