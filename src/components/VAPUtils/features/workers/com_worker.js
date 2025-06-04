import * as aq from "arquero";
import {
  computeChiSquaredValues,
  computeZscores,
  computeFvalues,
} from "@/components/VAPUtils/functions";

onmessage = function (event) {
  const [selection, groupVar, measure, p_value] = event.data;
  const table = aq.from(selection);
  let result;
  console.log("COM WROKER");
  if (measure === "Z-Score") result = computeZscores(table, groupVar, p_value);
  else if (measure === "F-Value")
    result = computeFvalues(table, groupVar, p_value);
  else if (measure === "Chi-Square")
    result = computeChiSquaredValues(selection, groupVar, p_value);
  const msg = {
    data: result,
    measure: measure,
  };

  if (result.length === 0) msg.measure = "No Data";

  console.log("WORKER RESPONSE:", msg);
  postMessage(msg);
};
