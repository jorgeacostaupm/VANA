import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { pubsub } from "@/utils/pubsub";

const { publish } = pubsub;

export default function useScatterData(isSync = true, params) {
  const [data, setData] = useState([]);
  const selection = useSelector((s) => s.dataframe.present.selection);

  useEffect(() => {
    if (!isSync) return;

    try {
      const { variables } = params;
      const res = variables.length >= 2 ? selection : null;
      setData(res);
    } catch (error) {
      publish("notification", {
        message: "Error computing data",
        description: error.message,
        type: "error",
      });
      setData(null);
    }
  }, [isSync, params, selection]);

  return [data, setData];
}
