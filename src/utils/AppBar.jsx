import React from "react";
import { Row, Col, Tooltip, Space, Typography } from "antd";
import styles from "./AppBar.module.css";

const { Title } = Typography;

export default function AppBar({ title, children }) {
  return (
    <div className={styles.bar}>
      <Row justify="space-between" align="middle" style={{ width: "100%" }}>
        <Col>
          <Tooltip title="Click to see the tutorial">
            <div className={styles.title}>{title}</div>
          </Tooltip>
        </Col>
        <Col>
          <Space size="large" align="center">
            {children}
          </Space>
        </Col>
      </Row>
    </div>
  );
}
