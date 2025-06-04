import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as d3 from "d3";
import navio from "navio";
import { setSelection } from "@/components/VAPUtils/features/cantab/cantabSlice";
import useResizeObserver from "@/utils/useResizeObserver";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export default function Overview() {
  const dispatch = useDispatch();
  const holderRef = useRef(null);
  const navioColumnsRef = useRef(null);
  const versionRef = useRef(null);
  const prevDimensionsRef = useRef({ width: null, height: null });

  const navioColumns = useSelector((state) => state.dataframe.navioColumns);
  const version = useSelector((state) => state.dataframe.version);
  const attrWidth = useSelector((state) => state.cantab.attrWidth);
  const dt = useSelector((state) => state.dataframe.dataframe);

  const dimensions = useResizeObserver(holderRef);
  const debouncedDimensions = useDebounce(dimensions, 200);

  function navioCallback(data) {
    const deepCopyData = JSON.parse(JSON.stringify(data));
    dispatch(setSelection(deepCopyData));
  }

  function updateNavio() {
    if (!dt || !debouncedDimensions || !navioColumns) return;

    const nv = navio(holderRef.current, debouncedDimensions.height);
    const deepCopyData = JSON.parse(JSON.stringify(dt));
    nv.attribWidth = attrWidth;
    nv.data(deepCopyData);
    nv.updateCallback(navioCallback);
    if (dt.length > 0) nv.addAllAttribs(navioColumns);
    nv.hardUpdate();

    d3.select(holderRef.current).select("svg").attr("id", "navio-svg");

    dispatch(setSelection(dt));
    navioColumnsRef.current = navioColumns;
    versionRef.current = version;
  }

  useEffect(() => {
    const navioColumnsChanged =
      JSON.stringify(navioColumnsRef.current) !== JSON.stringify(navioColumns);
    const versionChanged = versionRef.current !== version;
    if (navioColumnsChanged || versionChanged) {
      updateNavio();
    }
  }, [navioColumns, version]);

  useEffect(() => {
    if (!debouncedDimensions?.height || !debouncedDimensions?.width) return;

    const { width, height } = debouncedDimensions;
    const { width: prevWidth, height: prevHeight } = prevDimensionsRef.current;

    const hasChanged = width !== prevWidth || height !== prevHeight;

    if (hasChanged) {
      updateNavio();
      prevDimensionsRef.current = { width, height };
    }
  }, [debouncedDimensions]);

  useEffect(() => {
    updateNavio();
  }, [attrWidth]);

  return (
    <div
      style={{
        overflow: "visible",
        width: "100%",
        height: "100%",
        marginTop: "20px",
      }}
      ref={holderRef}
    ></div>
  );
}
