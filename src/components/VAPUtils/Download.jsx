import React from "react";
import { Popover } from "antd";
import { FileImageTwoTone } from "@ant-design/icons";

export const DownloadSVG = ({ id }) => {
  const handleClick = async () => {
    const { Canvg } = await import("canvg");
    const svg = document.getElementById(id);
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const scale = 4;
    const rect = svg.getBoundingClientRect();
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    ctx.scale(scale, scale);

    const svgString = new XMLSerializer().serializeToString(svg);
    const v = await Canvg.fromString(ctx, svgString);
    await v.render();

    const now = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -1);
    const filename = `${id}_${now}.png`;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Popover content="Download image" trigger="hover">
      <FileImageTwoTone
        className="downloadButton"
        onClick={handleClick}
        style={{ fontSize: "1.5em", cursor: "pointer" }}
      />
    </Popover>
  );
};

export default DownloadSVG;
