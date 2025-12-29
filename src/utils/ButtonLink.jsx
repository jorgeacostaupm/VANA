import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Apps } from "./Constants";
import PanelButton from "./PanelButton";

export default function LinkButton({ to, children, setInit, icon }) {
  const initialized = useSelector((state) => state[to].init);
  const dispatch = useDispatch();

  let appName = to;
  if (to === "metadata") appName = Apps.HIERARCHY;
  if (to === "compare") appName = Apps.COMPARE;
  if (to === "correlation") appName = Apps.CORRELATION;
  if (to === "evolution") appName = Apps.EVOLUTION;
  if (to === "cantab") appName = Apps.QUARANTINE;

  const handleOpenTab = () => {
    if (!initialized) {
      dispatch(setInit(true));
      window.open(
        window.location.href + "#/" + to,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <>
      <PanelButton
        title={"Open " + appName}
        onClick={handleOpenTab}
        icon={icon}
      />
    </>
  );
}
