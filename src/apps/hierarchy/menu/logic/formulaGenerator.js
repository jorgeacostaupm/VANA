import NodeFormatter from "./NodeFormater";

export default function buildAggregation(tokens) {
  const formatter = new NodeFormatter();
  const expression = formatter.format(tokens);
  const formula = `(r) => ${expression}`;

  return {
    formula,
    nodes: formatter.columnNames,
    columnOperations: formatter.columnOperations,
  };
}
