import * as d3 from "d3";
import store from "@/components/VAPUtils/features/store";
import jstat from "jstat";
import { moveTooltip, roundValue } from "@/components/VAPUtils/functions";
import { ORDER_VARIABLE } from "@/utils/Constants";
import { renderContextTooltip } from "@/components/VAPUtils/functions";
import {
  setHideGroups,
  setBlurGroups,
} from "../../VAPUtils/features/compare/compareSlice";
import { pubsub } from "@/components/VAPUtils/pubsub";
const { publish } = pubsub;

export default class DistributionsPlot {
  constructor(parent) {
    this.parent = parent;

    this.margin = { top: 20, right: 40, bottom: 40, left: 80 };

    this.range = 0.8;
    this.pointSize = 5;
    this.nPoints = 100;
    this.strokeWidth = 0;
    this.legentPointSize = 15;
    this.estimator = "density";

    this.colorScheme = d3.schemeCategory10;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.svg = d3.select(vis.parent);

    vis.chart = vis.svg
      .append("g")
      .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    vis.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip infoTooltip");
    vis.contextMenuTooltip = d3
      .select("body")
      .append("div")
      .attr("class", "contexMenuTooltip")
      .style("display", "none");
    vis.x_axis_g = vis.chart.append("g").attr("class", "x-axis");
    vis.y_axis_g = vis.chart.append("g").attr("class", "y-axis");
    vis.legend = d3.select("#compare-lines-legend");

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
    if (vis.estimator === "swarm") vis.renderSwarmPlot();
    else if (vis.estimator === "histogram") vis.renderHistogram();
    else if (vis.estimator === "density") vis.renderDensity();
  }

  updateVis() {
    let vis = this;

    vis.groupVar = store.getState().cantab.groupVar;
    vis.timeVar = store.getState().cantab.timeVar;
    vis.groups = store.getState().cantab.groups;

    vis.hideGroups = store.getState().compare.hideGroups;
    vis.blurGroups = store.getState().compare.blurGroups;

    vis.selectionGroups = store.getState().cantab.selectionGroups;

    vis.variable = store.getState().compare.selectedVar;

    vis.color = d3.scaleOrdinal().domain(vis.groups).range(vis.colorScheme);

    /* vis.statistics = store
      .getState()
      .compare.result.data.find((v) => v.variable === vis.variable)?.statistics; */

    vis.chart.selectAll(".density").remove();
    if (vis.estimator === "swarm") {
      vis.renderSwarmPlot();
    } else {
      vis.chart.selectAll(".swarmPoint").remove();
    }
    if (vis.estimator === "histogram") vis.updateHistogram();
    else if (vis.estimator === "density") vis.updateDensity();
    vis.renderLegend();
  }

  renderSwarmPlot() {
    let vis = this;

    vis.chart.selectAll(".density").remove();
    const points = store.getState().cantab.selection.map((point) => ({
      value: point[vis.variable],
      id: point[ORDER_VARIABLE],
      [ORDER_VARIABLE]: point[ORDER_VARIABLE],
      group: point[vis.groupVar],
      timestamp: point[vis.timeVar],
    }));

    vis.xScale = d3
      .scaleBand()
      .domain(vis.selectionGroups)
      .range([0, vis.width]);
    vis.yScale = d3
      .scaleLinear()
      .domain(d3.extent(points.map((d) => d.value)))
      .range([vis.height, 0])
      .nice();

    vis.chart
      .selectAll(".swarmPoint")
      .data(points, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "swarmPoint")
            .attr("fill", (d) => vis.color(d.group))
            .attr("r", vis.pointSize)
            .on("mouseover", function (e, d) {
              const target = e.target;
              d3.select(target).style("stroke", "black").raise();
              vis.tooltip.style("opacity", 1);
              vis.tooltip.html(`
                <strong>${d.group}</strong><br/>
                ${vis.variable}: ${roundValue(d.value)} <br>`);
            })
            .on("mousemove", function (e, d) {
              moveTooltip(e, vis.tooltip, vis.chart);
            })
            .on("mouseout", function (e, d) {
              const target = e.target;
              d3.select(target).style("stroke", null);
              vis.tooltip.style("opacity", 0);
            })
            .on("contextmenu", function (e, d) {
              e.preventDefault();
              vis.tooltip.style("opacity", 0);
              renderContextTooltip(vis.contextMenuTooltip, d);
              moveTooltip(e, vis.contextMenuTooltip, vis.chart);
            }),
        (update) => {
          update.attr("r", vis.pointSize);
        },
        (exit) => exit.remove()
      );

    points.forEach((d) => {
      d.x = vis.xScale(d.group) + vis.xScale.bandwidth() / 2;
      d.y = vis.yScale(d.value);
    });

    vis.chart.selectAll(".swarmPoint").style("opacity", 0);

    vis.chart
      .append("text")
      .attr("class", "simMsg")
      .attr("x", vis.width / 2)
      .attr("y", vis.height / 2)
      .attr("text-anchor", "middle")
      .text("Computing layout...");

    let simulation = d3
      .forceSimulation(points)
      .force("y", d3.forceY((d) => vis.yScale(d.value)).strength(1))
      .force("collide", d3.forceCollide(vis.pointSize))
      .alphaDecay(0)
      .alpha(0.2)
      .on("end", tick);

    function tick() {
      vis.chart.selectAll(".simMsg").remove();
      vis.chart
        .selectAll(".swarmPoint")
        .style("opacity", 1)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    }

    let init_decay = setTimeout(() => simulation.alphaDecay(0.2), 500);

    vis.x_axis_g.call(d3.axisBottom(vis.xScale));
    vis.y_axis_g.call(d3.axisLeft(vis.yScale));
  }

  updateDensity() {
    let vis = this;
    let allValues = vis.data.map((d) => +d.value);

    const minV = Math.min(...allValues);
    const maxV = Math.max(...allValues);
    const rangeV = maxV - minV;
    const margin = vis.range * rangeV;

    vis.xMin = minV - margin;
    vis.xMax = maxV + margin;

    const pointEstimator = computeEstimator(
      vis.nPoints,
      vis.estimator,
      vis.xMin,
      vis.xMax
    );

    vis.densities = vis.selectionGroups.map((group) => {
      const values = vis.data
        .filter(function (d) {
          return d.type === group;
        })
        .map(function (d) {
          return +d.value;
        });
      const density = pointEstimator(values, group);
      return { value: density, group: group };
    });

    vis.yMax = Math.max(
      ...vis.densities
        .map((d) => d.value)
        .flat()
        .map((d) => d[1])
    );

    vis.renderDensity();
  }

  renderDensity() {
    let vis = this;

    vis.xScale = d3
      .scaleLinear()
      .domain([vis.xMin, vis.xMax])
      .range([0, vis.width]);
    vis.yScale = d3.scaleLinear().range([vis.height, 0]).domain([0, vis.yMax]);

    vis.chart
      .selectAll(".density")
      .data(vis.densities)
      .join("path")
      .attr("class", "density")
      .classed("hide", (d) => vis.hideGroups.includes(d.group))
      .classed("blur", (d) => vis.blurGroups.includes(d.group))
      .attr("fill", (d) => vis.color(d.group))
      .attr("stroke", (d) => vis.color(d.group))
      .attr("stroke-width", vis.strokeWidth)
      .attr("d", (d) =>
        d3
          .line()
          .x(function (d) {
            return vis.xScale(d[0]);
          })
          .y(function (d) {
            return vis.yScale(d[1]);
          })
          .curve(d3.curveBasis)(d.value)
      )
      .on("mouseover", function (e, d) {
        vis.tooltip.style("visibility", "visible");
      })
      .on("mousemove", function (e, d) {
        const [x, y] = d3.pointer(e);
        const x_value = vis.xScale.invert(x);
        const y_value = vis.yScale.invert(y);
        vis.tooltip.html(`
          <strong>${d.group}</strong><br/>
          Value: ${y_value.toFixed(3)}`);

        moveTooltip(e, vis.tooltip, vis.chart);
      })
      .on("mouseout", function () {
        vis.tooltip.style("visibility", "hidden");
      });

    vis.x_axis_g.call(d3.axisBottom(vis.xScale));

    vis.y_axis_g.call(d3.axisLeft(vis.yScale));
  }

  updateHistogram() {
    let vis = this;
    let allValues = vis.data.map((d) => +d.value);

    vis.xMin = Math.min(...allValues);
    vis.xMax = Math.max(...allValues);

    const pointEstimator = computeEstimator(
      vis.nPoints,
      vis.estimator,
      vis.xMin,
      vis.xMax
    );

    vis.densities = vis.selectionGroups.map((group) => {
      const values = vis.data
        .filter(function (d) {
          return d.type === group;
        })
        .map(function (d) {
          return +d.value;
        });
      const density = pointEstimator(values);
      return { value: density, group: group };
    });

    vis.yMax = Math.max(
      ...vis.densities
        .map((d) => d.value)
        .flat()
        .map((d) => d[1])
    );

    vis.renderHistogram();
  }

  renderHistogram() {
    let vis = this;

    vis.xScale = d3
      .scaleLinear()
      .domain([vis.xMin, vis.xMax])
      .range([0, vis.width - 20]);
    vis.yScale = d3.scaleLinear().range([vis.height, 0]).domain([0, vis.yMax]);

    const bandwidth =
      (vis.xScale(vis.xMax) - vis.xScale(vis.xMin)) / vis.nPoints;

    vis.chart
      .selectAll(".density")
      .data(vis.densities)
      .join("g")
      .attr("class", "density")
      .classed("hide", (d) => vis.hideGroups.includes(d.group))
      .classed("blur", (d) => vis.blurGroups.includes(d.group))
      .each(function (d) {
        d3.select(this)
          .selectAll("rect")
          .data(d.value)
          .join("rect")
          .attr("x", (bin) => vis.xScale(bin[0]))
          .attr("y", (bin) => vis.yScale(bin[1]))
          .attr("width", bandwidth)
          .attr("height", (bin) => vis.height - vis.yScale(bin[1]))
          .attr("fill", vis.color(d.group))
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .on("mouseover", function (e, item) {
            vis.tooltip.style("opacity", 1);
            vis.tooltip.html(`
              <strong>${d.group}</strong><br/>
              nº items: ${item[1]}`);
          })
          .on("mousemove", function (e, d) {
            moveTooltip(e, vis.tooltip, vis.chart);
          })
          .on("mouseout", function () {
            vis.tooltip.style("opacity", 0);
          });
      });

    vis.x_axis_g.call(d3.axisBottom(vis.xScale));

    vis.y_axis_g.call(d3.axisLeft(vis.yScale));
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
      .attr("class", "legend-title")
      .attr("font-size", 16)
      .append("title")
      .text(vis.groupVar);

    vis.selectionGroups.forEach((d, i) => {
      const y = i * lineHeight + 50;

      legendGroup
        .append("circle")
        .attr("class", "legend-circle")
        .classed("blur", vis.blurGroups.includes(d))
        .attr("cx", circleSize + 10)
        .attr("cy", y)
        .attr("r", circleSize)
        .style("fill", vis.color(d))
        .on("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const item = d3.select(e.target);
          const isBlur = item.classed("blur");

          let blurGroups = store.getState().compare.blurGroups;
          blurGroups = isBlur
            ? blurGroups.filter((g) => g !== d)
            : [...blurGroups, d];
          store.dispatch(setBlurGroups(blurGroups));

          vis.chart
            .selectAll(".density")
            .filter((density) => density.group === d)
            .classed("blur", !isBlur);

          item.classed("blur", !isBlur);
        });

      // Etiqueta de grupo
      legendGroup
        .append("text")
        .attr("class", "legend")
        .classed("cross", vis.hideGroups.includes(d))
        .attr("x", circleSize * 2 + 15)
        .attr("y", y + 4)
        .text(d)
        .style("cursor", "pointer")
        .on("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const item = d3.select(e.target);
          const isHide = item.classed("cross");

          let hideGroups = store.getState().compare.hideGroups;
          hideGroups = isHide
            ? hideGroups.filter((g) => g !== d)
            : [...hideGroups, d];
          store.dispatch(setHideGroups(hideGroups));

          vis.chart
            .selectAll(".density")
            .filter((density) => density.group === d)
            .classed("hide", !isHide)
            .raise();

          item.classed("cross", !isHide);
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
}

function computeEstimator(numPoints, estimator, min, max) {
  if (estimator == "histogram") {
    return function histogramDensity(array) {
      const binWidth = (max - min) / numPoints;
      const bins = Array(numPoints).fill(0);

      array.forEach((value) => {
        if (value >= min && value <= max) {
          let binIndex = Math.floor((value - min) / binWidth);
          binIndex = Math.min(binIndex, numPoints - 1);
          bins[binIndex]++;
        }
      });

      const histogram = bins.map((count, i) => {
        const binCenter = min + binWidth * i;
        return [Number(binCenter), count];
      });

      return histogram;
    };
  } else {
    return function gaussianDensity(data, group) {
      data.sort((a, b) => a - b);

      const std = jstat.stdev(data);

      if (std === 0) {
        const uniformValue = data[0];
        let configuration = {
          message: `Group ${group} has a Uniform Distribution`,
          description: `Uniform Value: ${uniformValue}`,
          type: "info",
          pauseOnHover: true,
        };
        publish("notification", configuration);

        return Array.from({ length: numPoints }, (_, i) => [uniformValue, 1]);
      }

      const n = data.length;
      let bandwidth = 1.06 * std * Math.pow(n, -0.2);

      const step = (max - min) / (numPoints - 1);
      const xValues = Array.from(
        { length: numPoints },
        (_, i) => min + i * step
      );

      const tmp = xValues.map((x) => {
        const kernelEstimate = data.reduce((sum, xi) => {
          return sum + gaussianKernel((x - xi) / bandwidth);
        }, 0);
        return [x, kernelEstimate / (data.length * bandwidth)];
      });

      const maxDensity = Math.max(...tmp.map(([x, d]) => d));
      const density = tmp.map(([x, d]) => [x, d / maxDensity]);
      return density;
    };
  }
}

function gaussianKernel(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/* allValues.sort((a, b) => a - b);
    let points = 100;

    const step = (max - min) / (points - 1);
    const xValues = Array.from({ length: points }, (_, i) => min + i * step);

    return kernelDensityEstimator(kernelEpanechnikov(7), xValues);


function kernelDensityEstimator(kernel, X) {
  return function (V) {
    return X.map(function (x) {
      return [
        x,
        d3.mean(V, function (v) {
          return kernel(x - v);
        })
      ];
    });
  };
}

function kernelEpanechnikov(k) {
  return function (v) {
    return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
  };
}

 */
