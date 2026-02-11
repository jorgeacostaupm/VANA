import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout } from "antd";
import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import AppBar from "@/components/ui/AppBar";
import ColoredButton from "@/components/ui/ColoredButton";
import styles from "@/styles/App.module.css";
import useRootStyles from "@/hooks/useRootStyles";
import useNotification from "@/hooks/useNotification";
import { APP_NAME, APP_DESC } from "@/utils/Constants";
import { pubsub } from "@/utils/pubsub";

import { setInit } from "@/store/slices/cantabSlice";

import Explorer from "../explorer";
import loadTestData from "./loadTestData";
import AppsButtons from "./AppsButtons";

const { publish } = pubsub;
const ResponsiveGridLayout = WidthProvider(GridLayout);

const layout = [{ i: "explorer", x: 0, y: 0, w: 12, h: 7 }];

export default function MainApp() {
  const dispatch = useDispatch();
  const dataframe = useSelector((state) => state.dataframe.present.dataframe);
  const hierarchy = useSelector((state) => state.metadata.attributes);
  const [isLoadingDemoData, setIsLoadingDemoData] = useState(false);

  useRootStyles(setInit, APP_NAME);
  const holder = useNotification();

  useEffect(() => {
    if (Array.isArray(dataframe) && dataframe.length > 0) {
      if (Array.isArray(hierarchy) && hierarchy.length > 0) return;
    }
    loadTestData(dispatch);
  }, [dispatch, dataframe, hierarchy]);

  const onLoadDemoData = async () => {
    if (isLoadingDemoData) return;
    setIsLoadingDemoData(true);
    try {
      const isLoaded = await loadTestData(dispatch);
      if (isLoaded) {
        publish("notification", {
          message: "Demo data loaded",
          type: "success",
        });
      }
    } finally {
      setIsLoadingDemoData(false);
    }
  };

  return (
    <>
      {holder}
      <Layout className={styles.fullScreenLayout}>
        <AppBar description={APP_DESC}>
          <AppsButtons />
        </AppBar>

        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={100}
          isDraggable={false}
        >
          <div key={"explorer"}>
            <Explorer />
          </div>
        </ResponsiveGridLayout>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "8px 16px 12px",
            marginBottom: 16,
          }}
        >
          <ColoredButton
            onClick={onLoadDemoData}
            icon={isLoadingDemoData ? <LoadingOutlined /> : <ReloadOutlined />}
            disabled={isLoadingDemoData}
          >
            Load demo data
          </ColoredButton>
        </div>
      </Layout>
    </>
  );
}
