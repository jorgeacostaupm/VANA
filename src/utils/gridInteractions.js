import * as d3 from "d3";

function toSelection(target) {
  if (!target) return null;
  if (typeof target.selectAll === "function") return target;
  return d3.select(target);
}

function normalizeTickValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value * 1e9) / 1e9;
    return Object.is(rounded, -0) ? "0" : String(rounded);
  }
  return String(value);
}

export function attachTickLabelGridHover({
  axisGroup,
  gridGroup,
  lineSelector = "line",
  includeTick = () => true,
} = {}) {
  const axis = toSelection(axisGroup);
  const grid = toSelection(gridGroup);
  if (!axis || !grid || axis.empty() || grid.empty()) return;

  const linesByTick = new Map();
  grid.selectAll(".tick").each(function (tickValue, index, nodes) {
    const line = d3.select(this).select(lineSelector);
    if (line.empty() || !includeTick(tickValue, index, nodes)) {
      if (!line.empty()) {
        line.classed("chart-grid-line", false).classed("grid-line-active", false);
      }
      return;
    }

    line.classed("chart-grid-line", true);
    linesByTick.set(normalizeTickValue(tickValue), line);
  });

  const clearActive = () => {
    grid.selectAll(".grid-line-active").classed("grid-line-active", false);
  };

  axis
    .selectAll(".tick text")
    .on("mouseover.grid-line-highlight", function (_, tickValue) {
      clearActive();
      const key = normalizeTickValue(tickValue);
      const line = linesByTick.get(key);
      if (!line) return;

      line.classed("grid-line-active", true).raise();
      grid.raise();
      axis.raise();
    })
    .on("mouseout.grid-line-highlight", clearActive);

  grid.raise();
  axis.raise();
}

export function attachTickLabelToNearestGridLine({
  axisGroup,
  gridLines,
  valueToPosition,
  linePositionAccessor = (lineNode) => Number(lineNode.getAttribute("x1")),
  tolerance = 2,
} = {}) {
  const axis = toSelection(axisGroup);
  const lines = toSelection(gridLines);
  if (!axis || !lines || axis.empty() || lines.empty()) return;
  if (typeof valueToPosition !== "function") return;

  lines.classed("chart-grid-line", true);

  const lineNodes = lines.nodes().map((lineNode) => ({
    line: d3.select(lineNode),
    position: linePositionAccessor(lineNode),
  }));

  const clearActive = () => {
    lines.classed("grid-line-active", false);
  };

  axis
    .selectAll(".tick text")
    .on("mouseover.grid-line-highlight", function (_, tickValue) {
      clearActive();
      const targetPosition = valueToPosition(tickValue);
      if (!Number.isFinite(targetPosition)) return;

      let nearest = null;
      let nearestDistance = Infinity;

      lineNodes.forEach((candidate) => {
        if (!Number.isFinite(candidate.position)) return;
        const distance = Math.abs(candidate.position - targetPosition);
        if (distance < nearestDistance) {
          nearest = candidate;
          nearestDistance = distance;
        }
      });

      if (!nearest || nearestDistance > tolerance) return;

      nearest.line.classed("grid-line-active", true).raise();
      lines.raise();
      axis.raise();
    })
    .on("mouseout.grid-line-highlight", clearActive);

  lines.raise();
  axis.raise();
}
