import React, { useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import navio from "navio";
import { selectNavioColumns } from "@/store/slices/cantabSlice";

export default function Overview({ data, config, setSelection }) {
  const dispatch = useDispatch();
  const navioRef = useRef(null);

  const columns = useSelector(selectNavioColumns);

  const handleSelection = useCallback(
    (selection) => {
      dispatch(setSelection(JSON.parse(JSON.stringify(selection))));
    },
    [dispatch]
  );

  useEffect(() => {
    console.log("useEffect Overview");
    if (!data) return;

    const nv = navio(navioRef.current, config.navioHeight);
    nv.attribWidth = config.attrWidth;
    nv.y0 = config.navioLabelHeight;
    nv.attribFontSize = 16;
    nv.attribFontSizeSelected = 16;
    nv.filterFontSize = 12;
    nv.tooltipFontSize = 14;
    nv.tooltipBgColor = "#fff";
    nv.nullColor = "#f5dd07";
    nv.margin = 50;
    nv.tooltipMargin = 25;
    nv.data(JSON.parse(JSON.stringify(data)));
    nv.updateCallback(handleSelection);
    nv.addAllAttribs(columns);

    const innerDiv = navioRef.current.querySelector("div");
    if (innerDiv) {
      innerDiv.style.overflow = "visible";
    }
  }, [data, config, columns, handleSelection]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div ref={navioRef} style={{ fontSize: 14 }} />
    </div>
  );
}
