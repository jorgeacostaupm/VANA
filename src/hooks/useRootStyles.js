import { useEffect, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";

const useRootStyles = (
  setInit,
  title,
  applyStyles = { padding: 0, maxWidth: "100vw" },
) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const rootElement = document.getElementById("root");
    if (rootElement && applyStyles) {
      Object.assign(rootElement.style, applyStyles);
    }

    const hash = window.location.hash || "";
    const route = hash.startsWith("#/") ? hash.slice(2).split("/")[0] : "";
    if (route) {
      window.name = `vianna-app-${route}`;
    }

    if (title) {
      document.title = title;
    }
  }, [applyStyles, title]);

  useLayoutEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(setInit(false));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch, setInit]);
};

export default useRootStyles;
