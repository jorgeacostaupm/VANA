import * as d3 from "d3";
import store from "@/store/store";
import {
  computeEvolutionObservationData,
  moveTooltip,
} from "@/utils/functions";
import renderQTooltip from "@/utils/QuarantineTooltip";

export default class EvolutionsPlot {
  constructor(parent) {
    this.parent = parent;

    this.margin = { top: 20, right: 40, bottom: 40, left: 100 };

    this.showStds = false;
    this.showMeans = false;
    this.meanPointSize = 10;
    this.subjectPointSize = 5;
    this.subjectStrokeWidth = 2;
    this.meanStrokeWidth = 5;
    this.hideGroups = [];
    this.blurGroups = [];

    this.colorScheme = d3.schemeCategory10;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.svg = d3.select(vis.parent);

    vis.chart = vis.svg
      .append("g")
      .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    vis.tooltip = d3.select("body").select("div.tooltip");
    if (vis.tooltip?.empty()) {
      vis.tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }

    vis.contextMenuTooltip = d3.select("body").select("div.contextTooltip");
    if (vis.contextMenuTooltip.empty()) {
      vis.contextMenuTooltip = d3
        .select("body")
        .append("div")
        .attr("class", "contextTooltip");
    }

    vis.x_axis_g = vis.chart.append("g").attr("class", "x-axis");
    vis.y_axis_g = vis.chart.append("g").attr("class", "y-axis");

    const parentId = vis.parent.id;
    vis.legend = d3.select(`#${parentId}-legend`);

    const dimensions = vis.parent.getBoundingClientRect();
    vis.setSize(dimensions);
  }

  setSize(dimensions) {
    let vis = this;
    const { width, height } = dimensions;
    vis.width = width - vis.margin.left - vis.margin.right;
    vis.height = height - vis.margin.top - vis.margin.bottom;
    vis.total_width = width;
    vis.x_axis_g.attr("transform", `translate(0, ${vis.height})`);
  }

  onResize(dimensions) {
    let vis = this;
    vis.setSize(dimensions);
    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.selectionGroups = store.getState().cantab.present.selectionGroups;
    vis.groups = store.getState().cantab.present.groups;

    vis.selection = store.getState().dataframe.present.selection;
    vis.timestamps = store.getState().cantab.present.selectionTimestamps;
    vis.timestamps = vis.timestamps.map((t) => "" + t).sort();

    vis.groupVar = store.getState().cantab.present.groupVar;
    vis.timeVar = store.getState().cantab.present.timeVar;
    vis.idVar = store.getState().cantab.present.idVar;

    vis.variable = vis.config.variable;
    vis.showMeans = vis.config.showMeans;
    vis.showObs = vis.config.showObs;
    vis.showStds = vis.config.showStds;
    vis.meanPointSize = vis.config.meanPointSize;
    vis.subjectPointSize = vis.config.subjectPointSize;
    vis.meanStrokeWidth = vis.config.meanStrokeWidth;
    vis.subjectStrokeWidth = vis.config.subjectStrokeWidth;

    if (vis.idVar)
      vis.idGroups = computeEvolutionObservationData(
        vis.selection,
        vis.variable,
        vis.groupVar,
        vis.timeVar,
        vis.idVar
      );

    const sort_func = (a, b) => {
      return (
        vis.timestamps.indexOf(a[vis.timeVar]) -
        vis.timestamps.indexOf(b[vis.timeVar])
      );
    };

    vis.idGroups.forEach(function (d) {
      d[1].sort(sort_func);

      const group = d[1][0][vis.groupVar];
      d[2] = group;
    });

    let y_min, y_max;

    if (vis.config.useCustomRange) {
      y_min = vis.config.range[0];
      y_max = vis.config.range[1];
    } else if (vis.showObs) {
      ({ y_min, y_max } = findMinAndMaxSubjects(vis.idGroups, vis.variable));
    } else if (vis.showMeans) {
      ({ y_min, y_max } = findMinAndMaxMeans(vis.data, vis.showStds));
    } else {
      ({ y_min, y_max } = findMinAndMaxSubjects(vis.idGroups, vis.variable));
    }

    vis.color = d3.scaleOrdinal().domain(vis.groups).range(vis.colorScheme);

    vis.x_scale = d3.scaleBand().range([0, vis.width]).domain(vis.timestamps);
    const margin = (y_max - y_min) * 0.05;

    vis.y_scale = d3
      .scaleLinear()
      .domain([y_min - margin, y_max + margin])
      .range([vis.height, 0])
      .nice();

    vis.idLine = d3
      .line()
      .x((d) => {
        return vis.x_scale("" + d[vis.timeVar]) + vis.x_scale.bandwidth() / 2;
      })
      .y((d) => vis.y_scale(+d[vis.variable]))
      .bind(this);

    vis.updateMeans();

    vis.renderSubjects();

    vis.renderLegend();

    vis.x_axis_g.call(d3.axisBottom(vis.x_scale));
    vis.y_axis_g.call(d3.axisLeft(vis.y_scale));
  }

  updateMeans() {
    let vis = this;

    vis.dataReady = [];

    const sort_func = (a, b) => {
      return vis.timestamps.indexOf(a.time) - vis.timestamps.indexOf(b.time);
    };

    vis.data.forEach(function (grp, i) {
      const allTime = Object.keys(grp).filter((d) => d !== "population");

      const items = allTime.map((time) => ({
        time: time,
        value: grp[time],
        name: grp["population"],
      }));

      vis.dataReady.push({
        name: grp["population"],
        values: items.sort(sort_func),
        id: i,
      });
    });

    vis.line = d3
      .line()
      .x((d) => vis.x_scale(d.time) + vis.x_scale.bandwidth() / 2)
      .y((d) => vis.y_scale(+d.value.mean));

    vis.area = d3
      .area()
      .x((d) => vis.x_scale(d.time) + vis.x_scale.bandwidth() / 2)
      .y0((d) => vis.y_scale(+d.value.mean + +d.value.std))
      .y1((d) => vis.y_scale(+d.value.mean - +d.value.std));

    vis.renderMeans();
  }

  renderMeans() {
    let vis = this;

    if (!this.showMeans) {
      vis.chart.selectAll(".evolutionMean").remove();
      return;
    }

    if (!this.showStds) {
      vis.chart.selectAll(".evolutionStd").remove();
    }

    vis.chart
      .selectAll(".evolutionMean")
      .data(vis.dataReady)
      .join("g")
      .attr("class", "evolutionMean")
      .classed("hide", (d) => vis.hideGroups.includes(d.name))
      .each(function (d) {
        d3.select(this)
          .selectAll(".evolutionMeanLine")
          .data([d])
          .join("path")
          .attr("class", "evolutionMeanLine")
          .attr("d", (d) => vis.line(d.values))
          .attr("stroke", (d) => vis.color(d.name))
          .style("stroke-width", vis.meanStrokeWidth)
          .style("fill", "none");

        if (vis.showStds) {
          d3.select(this)
            .selectAll(".evolutionStd")
            .data([d])
            .join("path")
            .attr("class", "evolutionStd")
            .attr("d", (d) => vis.area(d.values))
            .attr("fill", (d) => vis.color(d.name))
            .style("opacity", 0.3)
            .style("stroke", "none");
        }

        d3.select(this)
          .selectAll(".means")
          .data([d])
          .join("g")
          .style("fill", (d) => vis.color(d.name))
          .attr("class", "means")
          .selectAll(".mean")
          .data((d) => d.values)
          .join("circle")
          .attr("class", "mean")
          .attr("cx", (d) => vis.x_scale(d.time) + vis.x_scale.bandwidth() / 2)
          .attr("cy", (d) => vis.y_scale(d.value.mean))
          .attr("r", vis.meanPointSize)
          .style("opacity", 1)
          .on("mouseover", function (event, d) {
            vis.tooltip.style("opacity", 1).html(`
              <strong>${d.name}</strong> <br>
                Mean: ${d.value.mean.toFixed(2)} <br>
                Stdv: ${d.value.std.toFixed(2)} <br>
                ${vis.timeVar}: ${d.time} <br>
              `);
          })
          .on("mousemove", function (e, d) {
            moveTooltip(e, vis.tooltip, vis.chart);
          })
          .on("mouseout", function () {
            vis.tooltip.style("opacity", 0);
          })
          .on("click", function (event, d) {});
      })
      .on("mouseover", function (e, d) {
        vis.chart.selectAll(".evolutionMean").style("opacity", 0);
        vis.chart.selectAll(".evolution").style("opacity", 0);
        d3.select(this).style("opacity", 1).raise();
        vis.chart
          .selectAll(".evolution")
          .filter((item) => item[2] === d.name)
          .style("opacity", 1)
          .raise();
      })
      .on("mouseout", function () {
        vis.chart.selectAll(".evolutionMean").style("opacity", null);
        vis.chart.selectAll(".evolution").style("opacity", null);
      })
      .raise();
  }

  renderSubjects() {
    let vis = this;

    if (!this.showObs) {
      vis.chart.selectAll(".evolution").remove();
      return;
    }

    vis.chart
      .selectAll(".evolution")
      .data(vis.idGroups)
      .join("g")
      .attr("class", "evolution")
      .classed("hide", (d) => vis.blurGroups.includes(d[2]))
      .each(function (d) {
        d3.select(this)
          .selectAll(".subjectLine")
          .data([d[1]])
          .join("path")
          .attr("class", "subjectLine")
          .attr("d", (d) => vis.idLine(d))
          .attr("stroke", vis.color(d[2]))
          .style("stroke-width", vis.subjectStrokeWidth)
          .style("fill", "none");

        d3.select(this)
          .selectAll(".subjectPoint")
          .data(d[1])
          .join("circle")
          .attr("class", "subjectPoint")
          .attr("fill", vis.color(d[2]))
          .attr(
            "cx",
            (d) =>
              vis.x_scale("" + d[vis.timeVar]) + vis.x_scale.bandwidth() / 2
          )
          .attr("cy", (d) => vis.y_scale(d[vis.variable]))
          .attr("r", vis.subjectPointSize)
          .attr("stroke", "transparent")
          .on("mouseover", function (event, d) {
            vis.tooltip.html(`
                <strong>${d[vis.groupVar]} </strong> <br>
                ${vis.idVar} : ${d[vis.idVar]}  <br>
                ${vis.variable}: ${d[vis.variable].toFixed(2)} <br>
                ${vis.timeVar}: ${d[vis.timeVar]} <br>
              `);

            vis.contextMenuTooltip.style("display") === "none"
              ? vis.tooltip.style("opacity", 1).html(html)
              : vis.tooltip.style("opacity", 0).html(html);
          })
          .on("mousemove", function (e, d) {
            moveTooltip(e, vis.tooltip, vis.chart);
          })
          .on("mouseout", function () {
            vis.tooltip.style("opacity", 0);
          })
          .on("contextmenu", function (e, d) {
            e.preventDefault();
            vis.tooltip.style("opacity", 0);
            renderQTooltip(vis.contextMenuTooltip, d, vis.idVar);
            moveTooltip(e, vis.contextMenuTooltip, vis.chart, 100);
          });
      })
      .on("mouseover", function (e, d) {
        if (e.target.classList.contains("subjectLine")) return;
        vis.chart.selectAll(".evolution").style("opacity", 0);
        d3.select(this).style("opacity", 1).raise();
      })
      .on("mouseout", function () {
        vis.chart.selectAll(".evolution").style("opacity", null);
      })
      .on("click", function (e, d) {
        const isSelected = d3.select(this).classed("selected");
        d3.select(this).classed("selected", !isSelected);
        d3.select(this)
          .selectAll(".subjectPoint")
          .classed("selected", !isSelected);
      })
      .raise();
  }

  renderLegend() {
    const vis = this;
    const circleSize = 10;
    const padding = 6;
    const lineHeight = circleSize * 2 + padding;

    vis.legend.selectAll("*").remove();

    const legendGroup = vis.legend.append("g").attr("class", "legend-group");

    legendGroup
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text(`${vis.groupVar}:`)
      .attr("class", "legendTitle");

    vis.selectionGroups.forEach((d, i) => {
      const y = i * lineHeight + 50;
      const legendItem = legendGroup
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(0,${y})`);

      legendItem
        .append("circle")
        .attr("class", "legend-circle")
        .attr("cx", circleSize + 10)
        .attr("cy", 0)
        .attr("r", circleSize)
        .style("fill", vis.color(d));
      /*         .on("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const item = d3.select(e.target);
          const isBlur = item.classed("blur");

          const idx = vis.blurGroups.indexOf(d);
          if (idx > -1) vis.blurGroups.splice(idx, 1);
          else vis.blurGroups.push(d);

          vis.chart
            .selectAll(".evolution")
            .filter((dd) => dd.group === d)
            .classed("blur", !isBlur)
            .raise();
          item.classed("blur", !isBlur);
        }); */

      legendItem
        .append("text")
        .attr("class", "legend")
        .classed("cross", vis.hideGroups.includes(d))
        .attr("x", circleSize * 2 + 15)
        .attr("y", 4)
        .text(d)
        .style("cursor", "pointer")
        .on("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const item = d3.select(e.target);
          const isHide = item.classed("cross");

          const idx = vis.blurGroups.indexOf(d);
          if (idx > -1) vis.blurGroups.splice(idx, 1);
          else vis.blurGroups.push(d);

          vis.chart
            .selectAll(".evolution")
            .filter((dd) => dd[2] === d)
            .classed("hide", !isHide)
            .raise();

          vis.chart
            .selectAll(".evolutionMean")
            .filter((dd) => dd.name === d)
            .classed("hide", !isHide)
            .raise();
          item.classed("cross", !isHide);
        });

      legendItem
        .on("mouseover", () => {
          vis.chart.selectAll(".evolutionMean").classed("tmp-blur", true);
          vis.chart
            .selectAll(".evolutionMean")
            .filter((dd) => dd.name === d)
            .classed("highlight", true)
            .raise();

          vis.chart.selectAll(".evolution").classed("tmp-blur", true);
          vis.chart
            .selectAll(".evolution")
            .filter((dd) => dd[2] === d)
            .classed("highlight", true);
        })
        .on("mouseout", () => {
          vis.chart
            .selectAll(".evolutionMean")
            .classed("tmp-blur", false)
            .classed("highlight", false);
          vis.chart
            .selectAll(".evolution")
            .classed("tmp-blur", false)
            .classed("highlight", false);
        });
    });
    const bbox = legendGroup.node().getBBox();

    const parent = vis.legend.node().parentNode;
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

    vis.legend
      .attr("width", bbox.x + bbox.width)
      .attr("height", bbox.y + bbox.height);
  }

  updateSizes() {
    this.chart
      .selectAll(".mean")
      .attr("display", this.showMeans ? "block" : "none");
    this.chart
      .selectAll(".evolutionMeanLine")
      .attr("display", this.showMeans ? "block" : "none");
    this.chart
      .selectAll(".evolutionStd")
      .attr("display", this.showStds ? "block" : "none");
    this.chart.selectAll(".mean").attr("r", this.meanPointSize);
    this.chart.selectAll(".subjectPoint").attr("r", this.subjectPointSize);
    this.chart
      .selectAll(".evolutionMeanLine")
      .style("stroke-width", this.meanStrokeWidth);
    this.chart
      .selectAll(".subjectLine")
      .style("stroke-width", this.subjectStrokeWidth);
  }
}

function findMinAndMaxSubjects(idGroups, variable) {
  let allValues = idGroups.flatMap((group) =>
    group[1].map((item) => +item[variable])
  );

  return {
    y_min: Math.min(...allValues),
    y_max: Math.max(...allValues),
  };
}

function findMinAndMaxMeans(data, useStds) {
  let allValues = [];

  data.forEach((grp) => {
    const allTime = Object.keys(grp).filter((d) => d !== "population");
    allTime.forEach((time) => {
      if (grp[time] && grp[time].std !== undefined && useStds) {
        allValues.push(+grp[time].mean + +grp[time].std);
        allValues.push(+grp[time].mean - +grp[time].std);
      } else if (grp[time]) {
        allValues.push(+grp[time].mean);
      }
    });
  });

  return {
    y_min: Math.min(...allValues),
    y_max: Math.max(...allValues),
  };
}
