import React, { useState } from "react";
import { Button, Card, Collapse } from "antd";
import { SettingOutlined } from "@ant-design/icons";

export const AppMenu = ({ items }) => {
  return (
    <div
      style={{
        position: "absolute",
        right: 5,
        top: 5,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <Menu items={items} />
    </div>
  );
};

const style = {
  position: "absolute",
  right: 0,
  width: "20%",
  minWidth: "300px",
  maxHeight: "70vh",
  overflowY: "auto",
  marginTop: "8px",
  background: "white",
};

export const Menu = ({ items }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <Button type="primary" onClick={() => setIsVisible(!isVisible)}>
        <SettingOutlined />
      </Button>

      {isVisible && (
        <div style={{ ...style }}>
          <Collapse bordered={true} size="large" items={items} />
        </div>
      )}
    </div>
  );
};

const myStyle = {
  position: "relative",
  right: 0,
  width: "auto",
  minWidth: "300px",
  maxHeight: "70vh",
  marginTop: "8px",
  fontSize: "16px", // tamaño base
};

export const ChartMenu = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        right: 5,
        top: 5,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <Button type="primary" onClick={() => setIsVisible(!isVisible)}>
        <SettingOutlined />
      </Button>

      {isVisible && (
        <Card
          style={myStyle}
          bodyStyle={{
            fontSize: myStyle.fontSize, // aplica el tamaño al body
            lineHeight: 1.5, // opcional, para mejor lectura
          }}
        >
          {/* envuelve los children en un div para heredar exactamente */}
          <div style={{ fontSize: "inherit" }}>{children}</div>
        </Card>
      )}
    </div>
  );
};
