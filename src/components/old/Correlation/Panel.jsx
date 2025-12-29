import React from "react";
import { Select } from "antd";
import { AreaChartOutlined } from "@ant-design/icons";

import AppBar from "@/utils/AppBar";
import { CORR_DESC, Graphs } from "@/utils/Constants";
import styles from "@/utils/App.module.css";
import ColoredButton from "@/utils/ColoredButton";

const { Option } = Select;

function Items({ generateGraph }) {
  const [chart, setChart] = useState(null);

  return (
    <div className={styles.panelBox}>
      <Select
        onChange={(v) => setChart(v)}
        placeholder="Select graph"
        style={{ width: "300px" }}
        size="large"
      >
        {Object.values(Graphs).map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <ColoredButton
        title={"Add the selected correlation chart"}
        icon={<AreaChartOutlined />}
        onClick={() => {
          if (chart) generateGraph(chart);
        }}
      />
    </div>
  );
}

export default function Panel(props) {
  const { generateGraph } = props;

  return (
    <AppBar description={CORR_DESC}>
      <Items generateGraph={generateGraph} />
    </AppBar>
  );
}
