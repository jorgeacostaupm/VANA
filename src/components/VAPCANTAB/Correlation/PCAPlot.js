import * as d3 from "d3";

export default function drawPCAPlot(data, config, parent, dimensions) {
  d3.select(parent).selectAll("*").remove();
  const margin = { top: 40, right: 40, bottom: 40, left: 80 };
  const legendRatio = 0.15;
  const chartRatio = 1 - legendRatio;
  const colorScheme = d3.schemeCategory10;

  const { groupVar } = config;

  console.log(data);

  const totalWidth = dimensions.width;
  const totalHeight = dimensions.height;
  const legendWidth = totalWidth * legendRatio;
  const chartAreaWidth = totalWidth * chartRatio;
  const chartWidth = chartAreaWidth - margin.left - margin.right;
  const chartHeight = totalHeight - margin.top - margin.bottom;
  const chartSize = Math.min(chartWidth, chartHeight);

  const svg = d3
    .select(parent)
    .append("svg")
    .attr("id", "chart")
    .attr("width", margin.left + chartSize + margin.right)
    .attr("height", margin.top + chartSize + margin.bottom)
    .style("display", "block");

  const legend = d3
    .select(parent)
    .append("div")
    .style("width", `${legendWidth}px`)
    .style("height", `${totalHeight}px`)
    .style("overflow", "auto")
    .style("display", "flex")
    .append("svg")
    .attr("id", "chart-legend")
    .attr("width", legendWidth)
    .attr("height", totalHeight)
    .style("display", "block");

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  const xExtent = d3.extent(data, (d) => d.pc1);
  const yExtent = d3.extent(data, (d) => d.pc2);

  const xScale = d3.scaleLinear().domain(xExtent).nice().range([0, chartSize]);
  const yScale = d3.scaleLinear().domain(yExtent).nice().range([chartSize, 0]);

  const allGroups = data.map((d) => d[groupVar]);
  const groupSet = new Set(allGroups);
  const groups = Array.from(groupSet);
  const colorScale = d3.scaleOrdinal().domain(groups).range(colorScheme);

  chart
    .append("g")
    .attr("transform", `translate(0,${chartSize})`)
    .call(d3.axisBottom(xScale));

  chart.append("g").call(d3.axisLeft(yScale));

  chart
    .append("text")
    .attr("x", chartSize / 2)
    .attr("y", chartSize + 40)
    .attr("text-anchor", "middle")
    .text("Var-1");

  chart
    .append("text")
    .attr("x", -chartSize / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Var-2");

  chart
    .selectAll(".dots")
    .data(data)
    .join("circle")
    .attr("class", (d) => "dots " + "group" + d[groupVar])
    .attr("cx", (d) => xScale(d.pc1))
    .attr("cy", (d) => yScale(d.pc2))
    .attr("r", 5)
    .attr("fill", (d) => colorScale(d[groupVar]))
    .attr("opacity", 0.7)
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`<strong>ID:</strong> ${d.id}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  renderLegend();

  function renderLegend() {
    const circleSize = 10;
    const padding = 6;
    const lineHeight = circleSize * 2 + padding;

    legend.selectAll("*").remove();

    const legendGroup = legend.append("g").attr("class", "legend-group");

    groups.forEach((d, i) => {
      const y = i * lineHeight + 50;

      legendGroup
        .append("circle")
        .attr("class", "legend-circle")
        .attr("cx", circleSize + 10)
        .attr("cy", y)
        .attr("r", circleSize)
        .style("fill", colorScale(d));

      legendGroup
        .append("text")
        .attr("class", "legend")
        .attr("x", circleSize * 2 + 15)
        .attr("y", y + 4)
        .text(d)
        .style("cursor", "pointer")
        .on("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const item = d3.select(e.target);
          const isHide = item.classed("cross");

          chart
            .selectAll(".group" + d)
            .classed("hide", !isHide)
            .raise();

          item.classed("cross", !isHide);
        });
    });

    const bbox = legendGroup.node().getBBox();

    const parent = legend.node().parentNode;
    const { width, height } = parent.getBoundingClientRect();

    if (height > bbox.y + bbox.height) {
      d3.select(parent).style("align-items", "center");
    } else {
      d3.select(parent).style("align-items", null);
    }

    if (width > bbox.x + bbox.width) {
      d3.select(parent).style("justify-content", "center");
    } else {
      d3.select(parent).style("justify-content", null);
    }

    legend
      .attr("width", bbox.x + bbox.width)
      .attr("height", bbox.y + bbox.height);
  }
}
