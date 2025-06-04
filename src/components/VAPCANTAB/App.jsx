import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, notification } from "antd";
import GridLayout, { WidthProvider } from "react-grid-layout";
import { updateData } from "@/components/VAPUtils/features/data/dataSlice";
import { pubsub } from "@/components/VAPUtils/pubsub";
import {
  useRootStyle,
  useNotificationSubscription,
} from "@/components/VAPCANTAB/Utils/hooks/cantabAppHooks";
import * as api from "@/components/VAPCANTAB/Utils/services/cantabAppServices";
import OverviewApp from "@/components/VAPCANTAB/Overview/OverviewApp";
import AppBar from "@/utils/AppBar";
import Buttons from "./Buttons";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import QuarantineApp from "./Quarantine/QuarantineApp";

const { publish } = pubsub;
const ResponsiveGridLayout = WidthProvider(GridLayout);

const defaultLayout = [{ i: "overview", x: 0, y: 0, w: 12, h: 12 }];

export default function App() {
  const dispatch = useDispatch();
  const [apiNotif, contextHolder] = notification.useNotification();
  const dt = useSelector((state) => state.dataframe.dataframe);

  useRootStyle();
  useNotificationSubscription(apiNotif);

  // State to track visible views and their grid positions
  const [views, setViews] = useState([{ id: "overview", type: "overview" }]);
  const [layout, setLayout] = useState(defaultLayout);

  // Example: function to add a new view (e.g., "means" or others)
  const createView = useCallback((type, props = {}) => {
    const id = `${type}-${Date.now()}`;
    const defaultW = 12;
    const defaultH = 12;

    setViews((prevViews) => [...prevViews, { id, type, ...props }]);

    setLayout((prevLayout) => [
      ...prevLayout,
      { i: id, x: 0, y: Infinity, w: defaultW, h: defaultH },
    ]);
  }, []);

  const removeView = useCallback((id) => {
    setViews((prevViews) => prevViews.filter((v) => v.id !== id));
    setLayout((prevLayout) => prevLayout.filter((l) => l.i !== id));
  }, []);

  useEffect(() => {
    if (!dt) {
      loadTestData(dispatch);
    }
  }, [dt, dispatch]);

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
        <AppBar title="EXPLORER">
          <Buttons createView={createView} />
        </AppBar>

        {dt && (
          <ResponsiveGridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={70}
            draggableHandle=".drag-handle"
            margin={[5, 5]}
            containerPadding={[20, 20]}
          >
            {views.map((v) => (
              <div key={v.id}>
                {v.type === "overview" && <OverviewApp />}
                {v.type === "quarantine" && (
                  <QuarantineApp removeView={() => removeView(v.id)} />
                )}
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </Layout>
    </>
  );
}

async function loadTestData(dispatch) {
  try {
    const shortTestData = "./vis/csv/full_data.csv";
    const data = await api.fetchTestData(shortTestData);
    await dispatch(
      updateData({ data, isGenerateHierarchy: true, filename: "Test data" })
    );
  } catch (error) {
    handleError(error, "Error loading test data");
  }
}

function handleError(error, message) {
  console.error(message, error);
  publish("notification", {
    message,
    description: error.message,
    type: "error",
  });
}
