import { useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import D3HierarchyEditor from "./D3HierarchyEditor";
import HierarchyEditorContextMenu from "./tools/EditorContextMenu";
import NodeMenu from "./menu/NodeMenu";
import useResizeObserver from "@/utils/useResizeObserver";
import { generateTree } from "@/utils/functions";
import styles from "@/utils/Charts.module.css";
import NoDataPlaceholder from "@/utils/NoDataPlaceholder";
import HierarchyBar from "./HierarchyBar";
import ViewMenu from "./tools/ViewMenu";

export default function HierarchyEditor() {
  const attributes = useSelector((state) => state.metadata.attributes);

  return (
    <div className={styles.viewContainer}>
      <HierarchyBar></HierarchyBar>
      {attributes?.length > 0 ? (
        <Hierarchy attributes={attributes} />
      ) : (
        <NoDataPlaceholder message="No hierarchy available" />
      )}
    </div>
  );
}

function Hierarchy({ attributes }) {
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  const dimensions = useResizeObserver(containerRef);
  const version = useSelector((state) => state.metadata.version);

  // Se hace update con version para las animaciones de las transiciones, hay parte que se hace desde d3hierarchyeditor
  const treeData = useMemo(() => generateTree(attributes, 0), [version]);

  // Inicialización / actualización del editor
  useEffect(() => {
    if (!containerRef.current) return;

    if (!editorRef.current) {
      editorRef.current = new D3HierarchyEditor(
        containerRef.current,
        treeData,
        dispatch
      );
    } else {
      editorRef.current.update(treeData);
    }

    return () => {
      editorRef.current?.destroy?.();
    };
  }, [treeData]);

  // Resize
  useEffect(() => {
    if (!editorRef.current || !dimensions) return;

    editorRef.current.onResize(dimensions);
  }, [dimensions]);

  return (
    <>
      <div className={styles.chartContainer}>
        <svg ref={containerRef} className={styles.chartSvg} />
      </div>

      {editorRef.current && (
        <HierarchyEditorContextMenu editor={editorRef.current} />
      )}

      <NodeMenu />
      <ViewMenu />
    </>
  );
}

/* function Hierarchy({ attributes }) {
  const dispatch = useDispatch();

  const version = useSelector((state) => state.metadata.version);
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  const dimensions = useResizeObserver(containerRef);
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.onResize(dimensions);
    }
  }, [dimensions]);

  useEffect(() => {
    const treeData = generateTree(attributes, 0);

    if (!editorRef.current) {
      editorRef.current = new D3HierarchyEditor(
        containerRef.current,
        treeData,
        dispatch
      );
    } else {
      editorRef.current.update(treeData);
    }
  }, [version, dispatch]);

  return (
    <>
      <div style={{ textAlign: "initial" }} className={styles.chartContainer}>
        <svg ref={containerRef} className={styles.chartSvg} />
      </div>
      <HierarchyEditorContextMenu editor={editorRef.current} />
      <NodeMenu></NodeMenu>
      <ViewMenu></ViewMenu>
    </>
  );
} */
