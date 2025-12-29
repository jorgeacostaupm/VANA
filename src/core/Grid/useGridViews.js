import { useState, useCallback } from "react";

const wideCharts = ["ranking", "numeric", "categoric", "evolution"];
const squareCharts = ["scatter", "corr", "pca"];

export default function useGridViews(defaultW = 3, defaultH = 4) {
  const [views, setViews] = useState([]);
  const [layout, setLayout] = useState([]);

  const addView = useCallback((type, props = {}) => {
    console.log("ADD VIEW:", type);
    const id = `${type}-${Date.now()}`;

    setViews((prev) => [{ id, type, ...props }, ...prev]);

    let x = type === "pointrange" ? 3 : 0;
    let yOffset = type === "pointrange" ? 0 : defaultH;
    let w = defaultW;
    let h = defaultH;
    if (wideCharts.includes(type)) w = 6;
    else if (squareCharts.includes(type)) (w = 8), (h = 8);
    setLayout((prev) => [
      { i: id, x, y: 0, w, h },
      ...prev.map((l) => ({ ...l, y: l.y + yOffset })),
    ]);
  }, []);

  const removeView = useCallback((id) => {
    setViews((p) => p.filter((v) => v.id !== id));
    setLayout((p) => p.filter((l) => l.i !== id));
  }, []);

  return { views, layout, setLayout, addView, removeView };
}
