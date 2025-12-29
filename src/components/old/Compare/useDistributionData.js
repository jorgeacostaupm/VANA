import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { pubsub } from "@/utils/pubsub";
const { publish } = pubsub;

export default function useDistributionData(getData, variable, isSync = true) {
  const [data, setData] = useState([]);
  const selection = useSelector((s) => s.dataframe.present.selection);
  const groupVar = useSelector((s) => s.cantab.present.groupVar);

  useEffect(() => {
    if (!isSync) return;

    try {
      const result = getData(selection, variable, groupVar);
      setData(result);
    } catch (error) {
      publish("notification", {
        message: "Error computing data",
        description: error.message,
        type: "error",
      });
      setData(null);
    }
  }, [isSync, variable, selection, groupVar]);

  return [data, setData];
}
