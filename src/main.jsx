import { createRoot } from "react-dom/client";
import AppRoutes from "./core/Routes";
import { ConfigProvider } from "antd";
import { theme } from "./theme";

import "./styles/index.css";
import "./styles/charts.css";

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <AppRoutes></AppRoutes>
    </ConfigProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
