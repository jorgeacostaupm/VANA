import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as aq from "arquero";

import { Typography, Space, Radio, Slider } from "antd";
import RankingPlot from "./RankingPlot";
import ChartBar from "@/utils/ChartBar";
import tests from "@/utils/tests";
import {
  setDesc,
  setNBars,
  setPValue,
} from "@/components/VAPUtils/features/compare/compareSlice";

import useResizeObserver from "@/components/VAPCANTAB/Utils/hooks/useResizeObserver";
import {
  selectNumericVars,
  selectCategoricalVars,
} from "../../VAPUtils/features/cantab/cantabSlice";
import styles from "@/utils//Charts.module.css";
import { VariableTypes } from "../../../utils/Constants";

export default function Ranking({ test, remove }) {
  const ref = useRef(null);
  const dimensions = useResizeObserver(ref);

  const groupVar = useSelector((state) => state.cantab.groupVar);
  const selection = useSelector((state) => state.cantab.selection);
  const numericVars = useSelector(selectNumericVars);
  const categoricVars = useSelector(selectCategoricalVars);

  const filterList = useSelector((state) => state.compare.filterList);
  const nBars = useSelector((state) => state.compare.nBars);
  const pValue = useSelector((state) => state.compare.pValue);
  const desc = useSelector((state) => state.compare.desc);

  const [ranking, setRanking] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setRanking(new RankingPlot(ref.current));
  }, []);

  useEffect(() => {
    if (ranking?.data && dimensions) {
      ranking.onResize(dimensions);
    }
  }, [dimensions]);

  useEffect(() => {
    console.log("selection", numericVars);
    if (test) {
      const testObj = tests.find((t) => t.label === test);
      const variables =
        testObj.variableType === VariableTypes.NUMERICAL
          ? numericVars
          : categoricVars;
      const table = aq.from(selection);
      const gTable = table.groupby(groupVar);
      const raw = gTable.objects({ grouped: "entries" });
      const data = [];

      for (const variable of variables) {
        const groups = raw.map(([name, rows]) => ({
          name,
          values: rows.map((r) => r[variable]),
        }));

        const res = testObj.run(groups);
        data.push({
          variable,
          value: res.metric.value,
          p_value: res.pValue,
          ...res,
        });
      }
      console.log(data);
      setResult({ data: data, measure: testObj.metric.symbol });
    }
  }, [selection, groupVar, numericVars, categoricVars, test]);

  useEffect(() => {
    if (ranking && result?.data) {
      ranking.data = result.data;
      ranking.measure = result.measure;
      ranking.pValue = pValue;
      ranking.desc = desc;
      ranking.filterList = filterList;
      ranking.nBars = nBars;

      ranking.updateVis();
    }
  }, [result, nBars, desc, filterList, pValue]);

  const info = `
  Test: ${test}
  Ranking measure: ${result?.measure}`;

  return (
    <>
      <div className={styles.viewContainer}>
        <ChartBar
          title={`Ranking - ${test}`}
          infoTooltip={info}
          svgIds={["compare-ranking"]}
          remove={remove}
        >
          <Options />
        </ChartBar>
        <svg ref={ref} id={"compare-ranking"} className="fill" />
      </div>
    </>
  );
}

const { Text } = Typography;
function Options() {
  const dispatch = useDispatch();
  const desc = useSelector((s) => s.compare.desc);
  const isNumeric = useSelector((s) => s.compare.isNumeric);
  const pValue = useSelector((s) => s.compare.pValue);
  const nBars = useSelector((s) => s.compare.nBars);

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {/* Sort order */}
      <div>
        <Text strong style={{ fontSize: "16px" }}>
          Sort Order:
        </Text>
        <Radio.Group
          style={{ marginLeft: 16 }}
          optionType="button"
          buttonStyle="solid"
          value={desc ? "desc" : "asc"}
          onChange={(e) => dispatch(setDesc(e.target.value === "desc"))}
        >
          <Radio.Button value="asc">Ascending</Radio.Button>
          <Radio.Button value="desc">Descending</Radio.Button>
        </Radio.Group>
      </div>

      <div>
        <Text strong style={{ fontSize: "16px" }}>
          P‑Value Threshold:
        </Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {" "}
          {pValue.toFixed(2)}
        </Text>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={pValue}
          onChange={(v) => dispatch(setPValue(v))}
        />
      </div>

      {/* Number of bars */}
      <div>
        <Text strong style={{ fontSize: "16px" }}>
          Number of Bars:
        </Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {" "}
          {nBars}
        </Text>
        <Slider
          min={1}
          max={50}
          step={1}
          value={nBars}
          onChange={(v) => dispatch(setNBars(v))}
        />
      </div>

      {/* <FilteredVariables /> */}
    </Space>
  );
}
