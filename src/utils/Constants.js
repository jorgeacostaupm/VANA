export const DEFAULT_ID_VARIABLE = "id";
export const DEFAULT_GROUP_VARIABLE = "Country";
export const DEFAULT_TIMESTAMP_VARIABLE = "Visit Name";

export const ORDER_VARIABLE = "__ord";
export const DESCRIPTION_VARIABLE = "__desc";

export const HIDDEN_VARIABLES = [ORDER_VARIABLE, DESCRIPTION_VARIABLE];

export const Apps = Object.freeze({
  HIERARCHY: "Hierarchy Editor",
  COMPARE: "Comparison",
  CORRELATION: "Correlation",
  EVOLUTION: "Evolution",
  MATRIX: "Matrix",
});

export const Graphs = Object.freeze({
  SCATTER: "Scatterplor Matrix",
  CORRELATION: "Correlation Matrix",
  PCA: "PCA",
  UMAP: "UMAP",
});

export const VariableTypes = Object.freeze({
  CATEGORICAL: "Categorical",
  NUMERICAL: "Numerical",
  UNKNOWN: "Unknown",
});
