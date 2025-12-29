import * as ss from "simple-statistics";
import { ORDER_VARIABLE } from "./Constants";

export function getCorrelationData(data, params) {
  const { variables } = params;
  const errors = [];

  if (variables.length < 2) return null;

  data.forEach((row, rowIndex) => {
    variables.forEach((varName) => {
      const raw = row[varName];
      const num = parseFloat(raw);
      if (
        raw == null ||
        typeof raw === "boolean" ||
        Number.isNaN(num) ||
        !Number.isFinite(num)
      ) {
        errors.push(`Invalid value: "${raw}" in variable "${varName}"`);
      }
    });
  });

  if (errors.length) {
    throw new Error(
      "Invalid values found:\n" + errors.map((msg) => ` • ${msg}`).join("\n")
    );
  }

  const correlationMatrix = [];

  for (let i = 0; i < variables.length; i++) {
    const var1 = variables[i];
    const column1 = data.map((d) => parseFloat(d[var1]));

    for (let j = i; j < variables.length; j++) {
      const var2 = variables[j];
      const column2 = data.map((d) => parseFloat(d[var2]));

      if (column1.length === column2.length && column1.length > 1) {
        const correlation = ss.sampleCorrelation(column1, column2);

        correlationMatrix.push({ x: var1, y: var2, value: correlation });
      }
    }
  }

  return correlationMatrix;
}

export function getTopCorrelations(data, nTop) {
  if (!data || data.length < 2 || !nTop || !Number.isInteger(nTop) || nTop <= 0)
    return null;

  const variables = Object.keys(data[0]).filter((key) => {
    return (
      typeof data[0][key] === "number" &&
      Number.isFinite(data[0][key]) &&
      key !== ORDER_VARIABLE
    );
  });

  if (variables.length < 2) return null;

  const correlations = [];
  for (let i = 0; i < variables.length; i++) {
    const var1 = variables[i];
    const column1 = data.map((d) => parseFloat(d[var1]));

    for (let j = i + 1; j < variables.length; j++) {
      const var2 = variables[j];
      const column2 = data.map((d) => parseFloat(d[var2]));

      if (
        column1.length === column2.length &&
        column1.length > 1 &&
        var1 !== var2
      ) {
        const correlation = ss.sampleCorrelation(column1, column2);
        if (!Number.isNaN(correlation)) {
          correlations.push({ x: var1, y: var2, value: correlation });
        }
      }
    }
  }

  const topCorrelations = correlations
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, nTop);

  const selectedVariables = new Set();
  topCorrelations.forEach((c) => {
    selectedVariables.add(c.x);
    selectedVariables.add(c.y);
  });

  const topVars = Array.from(selectedVariables);

  return topVars;
}

export function getScatterData(data, params) {
  const { variables } = params;
  if (variables?.length < 2) return null;
  return data;
}
