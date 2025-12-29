import { createRoot } from "react-dom/client";
import AppRoutes from "./core/Routes";
import { ConfigProvider } from "antd";

import "./styles/index.css";
import "./styles/charts.css";

export default function App() {
  return (
    <ConfigProvider theme={{ token: { fontSize: 16 } }}>
      <AppRoutes></AppRoutes>
    </ConfigProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
