import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as d3 from "d3";
import styles from "@/utils//Charts.module.css";
import { moveTooltip } from "../../VAPUtils/functions";
import useResizeObserver from "@/components/VAPCANTAB/Utils/hooks/useResizeObserver";
import { Typography, Space, Slider, Radio } from "antd";
import {
  setPwShape,
  setPwShapeSize,
  setPwCapSize,
} from "@/components/VAPUtils/features/compare/compareSlice";
import ChartBar from "@/utils/ChartBar";
import * as aq from "arquero";
import tests from "@/utils/tests";

export default function Pairwise({ variable, test, remove }) {
  const containerRef = useRef();
  const dimensions = useResizeObserver(containerRef);

  const selection = useSelector((s) => s.cantab.selection);
  const groupVar = useSelector((s) => s.cantab.groupVar);

  const showCaps = useSelector((s) => s.compare.pwShowCaps);
  const capSize = useSelector((s) => s.compare.pwCapSize);
  const markerShape = useSelector((s) => s.compare.pwShape);
  const markerSize = useSelector((s) => s.compare.pwShapeSize);

  const [result, setResult] = useState(null);

  useEffect(() => {
    if (variable && test) {
      const table = aq.from(selection);
      const gTable = table.groupby(groupVar);
      const rawGroups = gTable.objects({ grouped: "entries" });

      const groups = rawGroups.map(([name, rows]) => ({
        name,
        values: rows.map((r) => r[variable]),
      }));

      const testObj = tests.find((t) => t.label === test);
      if (!testObj) {
        throw new Error(`Test not found: ${test}`);
      }
      const r = testObj.run(groups);
      console.log(r);
      setResult(r);
    }
  }, [variable, test, selection, groupVar]);

  useEffect(() => {
    if (!dimensions || !result?.pairwiseEffects || !result?.pairwiseTitle)
      return;

    const data = result.pairwiseEffects;

    d3.select(containerRef.current).select("#pw-plot").remove();
    const margin = { top: 10, right: 40, bottom: 40, left: 180 };
    const totalWidth = dimensions.width;
    const totalHeight = dimensions.height;
    const chartWidth = totalWidth - margin.left - margin.right;
    const chartHeight = data.length * 45;

    const tooltip = d3.select("body").append("div").attr("class", "tooltip");
    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("id", "pw-plot")
      .attr("width", totalWidth)
      .attr("height", chartHeight + margin.top + margin.bottom)
      .style("bottom", 0)
      .style("display", "block");

    if (totalHeight > chartHeight + margin.top + margin.bottom)
      svg.style("position", "absolute").style("bottom", 0).style("left", 0);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const labels = data.map((d) => d.groups.join(" vs "));
    const rawLower = d3.min(data, (d) => d.ci95.lower);
    const rawUpper = d3.max(data, (d) => d.ci95.upper);
    const x = d3
      .scaleLinear()
      .domain([rawLower, rawUpper])
      .nice()
      .range([0, chartWidth]);
    const y = d3
      .scaleBand()
      .domain(labels)
      .range([0, chartHeight])
      .padding(0.2);

    chart
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text") // grab the tick labels
      .style("font-size", "16px");

    // bottom axis
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll("text") // grab the tick labels
      .style("font-size", "16px");

    if (x.domain()[0] < 0 && x.domain()[1] > 0) {
      chart
        .append("line")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "4 2")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", 0)
        .attr("y2", chartHeight);
    }

    chart
      .selectAll(".effect-bar")
      .data(data)
      .join("line")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("x1", (d) => x(d.ci95.lower))
      .attr("x2", (d) => x(d.ci95.upper))
      .attr("y1", (_, i) => y(labels[i]) + y.bandwidth() / 2)
      .attr("y2", (_, i) => y(labels[i]) + y.bandwidth() / 2)
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<strong>${d.groups.join(" vs ")}</strong><br/>` +
              `${d.measure}: ${d.value.toFixed(2)}<br/>` +
              `CI: [${d.ci95.lower.toFixed(2)}, ${d.ci95.upper.toFixed(2)}]` +
              `p-value: ${d.pValue.toFixed(2)}`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => moveTooltip(event, tooltip, chart))
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    if (showCaps) {
      chart
        .selectAll(".cap-left")
        .data(data)
        .join("line")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("x1", (d) => x(d.ci95.lower))
        .attr("x2", (d) => x(d.ci95.lower))
        .attr("y1", (_, i) => y(labels[i]) + y.bandwidth() / 2 - capSize)
        .attr("y2", (_, i) => y(labels[i]) + y.bandwidth() / 2 + capSize);
      chart
        .selectAll(".cap-right")
        .data(data)
        .join("line")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("x1", (d) => x(d.ci95.upper))
        .attr("x2", (d) => x(d.ci95.upper))
        .attr("y1", (_, i) => y(labels[i]) + y.bandwidth() / 2 - capSize)
        .attr("y2", (_, i) => y(labels[i]) + y.bandwidth() / 2 + capSize);
    }

    // Draw mean marker
    if (markerShape === "circle") {
      chart
        .selectAll(".effect-point")
        .data(data)
        .join("circle")
        .attr("class", "effect-point")
        .attr("cx", (d) => x(d.value))
        .attr("cy", (_, i) => y(labels[i]) + y.bandwidth() / 2)
        .attr("r", markerSize);
    } else {
      const symbolType =
        markerShape === "square" ? d3.symbolSquare : d3.symbolDiamond;
      const symbolGen = d3
        .symbol()
        .type(symbolType)
        .size(markerSize * markerSize * 4);
      chart
        .selectAll(".effect-point")
        .data(data)
        .join("path")
        .attr("class", "effect-point")
        .attr("d", symbolGen)
        .attr("transform", (_, i) => {
          const d = data[i];
          return `translate(${x(d.value)},${y(labels[i]) + y.bandwidth() / 2})`;
        });
    }

    chart
      .selectAll(".effect-point")
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<strong>${d.groups.join(" vs ")}</strong><br/>` +
              `${d.measure}: ${d.value.toFixed(2)}<br/>` +
              `CI: [${d.ci95.lower.toFixed(2)}, ${d.ci95.upper.toFixed(
                2
              )}]<br/>` +
              `p-value: ${d.pValue.toFixed(2)}`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => moveTooltip(event, tooltip, chart))
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    return () => tooltip.remove();
  }, [result, dimensions, showCaps, capSize, markerShape, markerSize]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={variable + " - " + test}
        infoTooltip={result?.descriptionJSX}
        svgIds={["pw-plot"]}
        remove={remove}
      >
        <Options></Options>
      </ChartBar>

      <div ref={containerRef} className={styles.chartContainer}></div>
    </div>
  );
}

const { Text } = Typography;

function Options() {
  const dispatch = useDispatch();
  const showCaps = useSelector((s) => s.compare.pwShowCaps);
  const capSize = useSelector((s) => s.compare.pwCapSize);
  const markerShape = useSelector((s) => s.compare.pwShape);
  const markerSize = useSelector((s) => s.compare.pwShapeSize);

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div>
        <Text strong style={{ fontSize: 16 }}>
          Marker Shape:
        </Text>
        <Radio.Group
          style={{ marginLeft: 16 }}
          optionType="button"
          buttonStyle="solid"
          value={markerShape}
          onChange={(e) => dispatch(setPwShape(e.target.value))}
        >
          <Radio.Button value="circle">Circle</Radio.Button>
          <Radio.Button value="square">Square</Radio.Button>
          <Radio.Button value="diamond">Diamond</Radio.Button>
        </Radio.Group>
      </div>

      <div>
        <Text strong style={{ fontSize: 16 }}>
          Marker Size:
        </Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {markerSize}px
        </Text>
        <Slider
          min={4}
          max={20}
          step={1}
          value={markerSize}
          onChange={(v) => dispatch(setPwShapeSize(v))}
        />
      </div>
      <div>
        <Text strong style={{ fontSize: 16 }}>
          Cap Size:
        </Text>
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {capSize}px
        </Text>
        <Slider
          min={0}
          max={20}
          step={1}
          value={capSize}
          onChange={(v) => dispatch(setPwCapSize(v))}
        />
      </div>
    </Space>
  );
}
