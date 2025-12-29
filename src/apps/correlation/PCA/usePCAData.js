import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { getPCAData } from "@/utils/functions";
import { pubsub } from "@/utils/pubsub";

const { publish } = pubsub;

export default function usePCAData(isSync = true, params, setInfo) {
  const [data, setData] = useState([]);
  const selection = useSelector((s) => s.dataframe.present.selection);

  useEffect(() => {
    if (!isSync || params.variables.length < 2) return;

    try {
      let res = getPCAData(selection, params);
      setData(res.points);
      setInfo(res.info);
    } catch (error) {
      publish("notification", {
        message: "Error computing data",
        description: error.message,
        type: "error",
      });
      setData(null);
    }
  }, [selection, isSync, params]);

  return [data, setData];
}
