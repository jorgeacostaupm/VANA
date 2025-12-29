import { useSelector } from "react-redux";

import { selectCategoricalVars } from "@/store/slices/cantabSlice";
import { setInit } from "@/store/slices/compareSlice";
import { Apps } from "@/utils/Constants";
import registry from "./registry";
import Grid from "@/core/Grid";
import Panel from "./Panel";

export default function CompareApp() {
  const cVars = useSelector(selectCategoricalVars);
  const panel = (addView) => (
    <Panel
      generateDistribution={(variable) =>
        addView(cVars.includes(variable) ? "categoric" : "numeric", {
          variable,
        })
      }
      generateTest={(test, variable) => {
        const isCat = cVars.includes(variable);
        addView("pairwise", { test, variable });
        if (!isCat) addView("pointrange", { test, variable });
      }}
      generateRanking={(test) => addView("ranking", { test })}
    />
  );

  return (
    <Grid
      setInit={setInit}
      registry={registry}
      componentName={Apps.COMPARE}
      panel={panel}
    />
  );
}
