import React from "react";
import { DownloadOutlined } from "@ant-design/icons";
import BarButton from "./BarButton";

export default function DownloadButton({ filename = "chart", svgIds = [] }) {
  return (
    <BarButton
      title="Download view as svg"
      icon={<DownloadOutlined />}
      onClick={() => handleDownload(filename, svgIds)}
    />
  );
}

function handleDownload(filename, svgIds) {
  try {
    const combinedSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    combinedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    let totalWidth = 0;
    let maxHeight = 0;

    for (const id of svgIds) {
      const svg = document.getElementById(id);
      if (!svg) continue;

      const clone = svg.cloneNode(true);
      const { width, height } = svg.getBoundingClientRect();

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${totalWidth}, 0)`);
      g.appendChild(clone);

      combinedSvg.appendChild(g);
      totalWidth += width;
      maxHeight = Math.max(maxHeight, height);
    }

    combinedSvg.setAttribute("width", totalWidth);
    combinedSvg.setAttribute("height", maxHeight);

    const styleEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );

    const cssRules = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch (e) {
          return "";
        }
      })
      .join("\n");
    styleEl.textContent = cssRules;

    combinedSvg.insertBefore(styleEl, combinedSvg.firstChild);

    const serialized = new XMLSerializer().serializeToString(combinedSvg);
    const blob = new Blob([serialized], { type: "image/svg+xml" });

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -1);
    const fullFilename = `${filename}_${timestamp}.svg`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fullFilename;
    link.click();

    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Download error:", err);
  }
}
