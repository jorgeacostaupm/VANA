import React, { useEffect, useRef, useState, useCallback } from "react";
import { Row, Space, Popover } from "antd";
import styles from "./App.module.css";

export default function AppBar({ description = null, children }) {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const spaceRef = useRef(null);
  const [hideTitle, setHideTitle] = useState(false);

  const checkOverlap = useCallback(() => {
    const container = containerRef.current;
    const titleEl = titleRef.current;
    const spaceEl = spaceRef.current;

    if (!container || !titleEl || !spaceEl) return;

    const containerWidth = container.offsetWidth;
    const titleWidth = titleEl.offsetWidth;
    const spaceWidth = spaceEl.offsetWidth;

    const margin = 40;
    const totalNeeded = titleWidth + spaceWidth + margin;

    setHideTitle(totalNeeded > containerWidth);
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(checkOverlap);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (titleRef.current) {
      resizeObserver.observe(titleRef.current);
    }
    if (spaceRef.current) {
      resizeObserver.observe(spaceRef.current);
    }

    window.addEventListener("resize", checkOverlap);

    checkOverlap();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverlap);
    };
  }, [checkOverlap]);

  return (
    <div className={styles.bar} ref={containerRef}>
      <Row align="middle">
        <Popover
          className={styles.title}
          content={
            <div
              style={{
                maxWidth: 700,
                whiteSpace: "normal",
                wordBreak: "break-word",
                textAlign: "justify",
              }}
            >
              {description}
            </div>
          }
          trigger="hover"
          placement="bottomRight"
        >
          <div
            ref={titleRef}
            style={{ visibility: hideTitle ? "hidden" : "visible" }}
          >
            <img src="./favicon_no_bg.svg" alt="VANA" />
          </div>
        </Popover>

        <Space
          ref={spaceRef}
          style={{
            background: "var(--primary-color)",
            right: 20,
            position: "absolute",
          }}
          size="large"
          align="center"
        >
          {children}
        </Space>
      </Row>
    </div>
  );
}
