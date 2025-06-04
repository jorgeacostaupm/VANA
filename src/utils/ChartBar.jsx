import React, { useState, useEffect } from "react";
import { Button, Card, Tooltip } from "antd";
import {
  SettingOutlined,
  ExportOutlined,
  InfoCircleFilled,
  CloseOutlined,
} from "@ant-design/icons";
import DownloadButton from "./DownloadButton";
import AutoCloseTooltip from "./AutoCloseTooltip";
import styles from "./ChartBar.module.css";
import buttonStyles from "./Buttons.module.css";

export const iconStyle = { fontSize: "25px" };

export default function ChartBar({
  children,
  title,
  svgIds,
  remove,
  infoTooltip = "",
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={styles.chartBar}>
      <div className={`${styles.dragHandle} drag-handle`}></div>

      <div className={styles.chartTitle}>{title}</div>

      <div className={styles.right}>
        {svgIds && (
          <DownloadButton
            svgIds={svgIds}
            filename={`${title}_${infoTooltip}`}
          />
        )}

        {infoTooltip && (
          <Tooltip title={infoTooltip}>
            <Button
              className={buttonStyles.coloredButton}
              shape="circle"
              icon={<InfoCircleFilled style={iconStyle} />}
            />
          </Tooltip>
        )}

        <AutoCloseTooltip title="Chart settings">
          <Button
            className={buttonStyles.coloredButton}
            shape="circle"
            icon={<SettingOutlined style={iconStyle} />}
            onClick={() => setIsVisible(!isVisible)}
          />
        </AutoCloseTooltip>

        {remove && (
          <AutoCloseTooltip title="Close view">
            <Button
              className={buttonStyles.coloredButton}
              shape="circle"
              icon={<CloseOutlined style={iconStyle} />}
              onClick={remove}
            />
          </AutoCloseTooltip>
        )}

        {isVisible && (
          <Card size="small" className={styles.options}>
            <div>{children}</div>
          </Card>
        )}
      </div>
    </div>
  );
}

export function NodeBar({ title, remove }) {
  return (
    <div className={styles.chartBar}>
      <div className={styles.chartTitle}>{title}</div>

      <div className={styles.right}>
        {remove && (
          <AutoCloseTooltip title="Close">
            <Button
              className={buttonStyles.coloredButton}
              shape="circle"
              icon={<CloseOutlined style={iconStyle} />}
              onClick={remove}
            />
          </AutoCloseTooltip>
        )}
      </div>
    </div>
  );
}

export function Bar({ children, title }) {
  return (
    <div className={styles.chartBar}>
      <div className={`${styles.dragHandle} drag-handle`}></div>

      <div className={styles.chartTitle}>{title}</div>

      <div className={styles.right}>{children}</div>
    </div>
  );
}
