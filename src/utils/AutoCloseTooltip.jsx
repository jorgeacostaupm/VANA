import React, { useState, useEffect } from "react";
import { Tooltip } from "antd";

export default function AutoCloseTooltip({ title, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => setVisible(false), 1500);
    }
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <Tooltip title={title} open={visible} onOpenChange={setVisible}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>
    </Tooltip>
  );
}
