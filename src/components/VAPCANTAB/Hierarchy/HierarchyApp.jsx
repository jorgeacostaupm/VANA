import React from "react";
import { Layout, notification } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import {
  useRootStyle,
  useNotificationSubscription,
} from "@/components/VAPCANTAB/Utils/hooks/cantabAppHooks";
import AppBar from "@/utils/AppBar";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import HierarchyEditor from "./HierarchyEditor";
import Buttons from "./Buttons";

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function HierarchyApp() {
  const [apiNotif, contextHolder] = notification.useNotification();

  useRootStyle();
  useNotificationSubscription(apiNotif);

  const layout = [
    {
      i: "overview",
      x: 0,
      y: 0,
      w: 12,
      h: 12,
    },
  ];

  return (
    <>
      {contextHolder}
      <Layout
        style={{
          height: "100vh",
          width: "100vw",
          background: "#f0f2f5",
          overflow: "auto",
        }}
      >
        <AppBar title="HIERARCHY">
          <Buttons></Buttons>
        </AppBar>
        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={70}
          draggableHandle=".drag-handle"
          margin={[5, 5]}
          containerPadding={[20, 20]}
        >
          <div key="overview">
            <HierarchyEditor />
          </div>
        </ResponsiveGridLayout>
      </Layout>
    </>
  );
}
