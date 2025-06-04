import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import EvolutionsPlot from "./EvolutionsPlot";

import styles from "@/utils//Charts.module.css";
import ChartBar from "@/utils/ChartBar";
import { getEvolutionData } from "@/utils/functions";
import useResizeObserver from "@/components/VAPCANTAB/Utils/hooks/useResizeObserver";

export default function Evolutions({ variable, remove }) {
  const [chart, setChart] = useState(null);

  const selection = useSelector((state) => state.cantab.selection);
  const isNumeric = useSelector((state) => state.evolution.isNumeric);
  const groupVar = useSelector((state) => state.cantab.groupVar);
  const timeVar = useSelector((state) => state.cantab.timeVar);

  const showStds = useSelector((state) => state.evolution.showStds);
  const showMeans = useSelector((state) => state.evolution.showMeans);
  const meanPointSize = useSelector((state) => state.evolution.meanPointSize);
  const subjectPointSize = useSelector((s) => s.evolution.subjectPointSize);
  const meanStrokeWidth = useSelector((s) => s.evolution.meanStrokeWidth);
  const subjectStrokeWidth = useSelector((s) => s.evolution.subjectStrokeWidth);

  const ref = useRef(null);
  const refLegend = useRef(null);
  const dimensions = useResizeObserver(ref);

  useEffect(() => {
    const evolutions = new EvolutionsPlot(ref.current);
    setChart(evolutions);
  }, []);

  useEffect(() => {
    if (chart?.data && dimensions) {
      chart.onResize(dimensions);
    }
  }, [dimensions]);

  useEffect(() => {
    if (variable && chart) {
      if (isNumeric) {
        const data = getEvolutionData(selection, variable, groupVar, timeVar);
        console.log(data);
        chart.data = data;

        chart.showStds = showStds;
        chart.showMeans = showMeans;
        chart.meanPointSize = meanPointSize;
        chart.meanStrokeWidth = meanStrokeWidth;
        chart.subjectPointSize = subjectPointSize;
        chart.subjectStrokeWidth = subjectStrokeWidth;
        chart.updateVis();
      }
    }
  }, [
    variable,
    chart,
    selection,
    groupVar,
    timeVar,
    showStds,
    showMeans,
    meanPointSize,
    meanStrokeWidth,
    subjectPointSize,
    subjectStrokeWidth,
  ]);

  return (
    <div className={styles.viewContainer}>
      <ChartBar
        title={`${variable} - Evolution`}
        svgIds={["evolution-lines-legend", "evolution-lines"]}
        infoTooltip={"Evolution plots"}
        remove={remove}
      >
        <Options></Options>
      </ChartBar>
      <div
        className={styles.chartLegendContainer}
        style={{ display: "flex", flexDirection: "row" }}
      >
        <div className={styles.legend}>
          <svg
            ref={refLegend}
            id="evolution-lines-legend"
            className={styles.legendSvg}
          />
        </div>

        <div className={styles.distributionChart}>
          <svg id="evolution-lines" ref={ref} className={styles.chartSvg} />
        </div>
        <div id="lines-tooltip"></div>
        <div id="contextmenu-tooltip"></div>
      </div>
    </div>
  );
}

import { Checkbox, Slider } from "antd";

import {
  setShowStd,
  setShowMeans,
  setMeanPointSize,
  setSubjectPointSize,
  setMeanStrokeWidth,
  setSubjectStrokeWidth,
} from "@/components/VAPUtils/features/evolution/evolutionSlice";

function Options() {
  const showStds = useSelector((state) => state.evolution.showStds);
  const showMeans = useSelector((state) => state.evolution.showMeans);

  const dispatch = useDispatch();

  const onChangeShowStdCheckbox = (e) => {
    dispatch(setShowStd(e.target.checked));
  };

  const onChangeShowMeansCheckbox = (e) => {
    dispatch(setShowMeans(e.target.checked));
  };

  return (
    <div>
      <Checkbox checked={showStds} onChange={onChangeShowStdCheckbox}>
        Show Observations
      </Checkbox>
      <Checkbox checked={showMeans} onChange={onChangeShowMeansCheckbox}>
        Show Means
      </Checkbox>
      <MeanPointSizeSlider />
      <SubjectPointSizeSlider />
      <MeanStrokeWidthSlider />
      <SubjectStrokeWidthSlider />
    </div>
  );
}

const MeanPointSizeSlider = () => {
  const dispatch = useDispatch();
  const meanPointSize = useSelector((state) => state.evolution.meanPointSize);

  const onSliderComplete = (value) => {
    dispatch(setMeanPointSize(value));
  };

  return (
    <div>
      <div>Mean Point Size:</div>
      <Slider
        min={1}
        max={40}
        defaultValue={meanPointSize}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: "100%" }}
      />
    </div>
  );
};

const SubjectPointSizeSlider = () => {
  const dispatch = useDispatch();
  const subjectPointSize = useSelector(
    (state) => state.evolution.subjectPointSize
  );

  const onSliderComplete = (value) => {
    dispatch(setSubjectPointSize(value));
  };

  return (
    <div>
      <div>Subject Point Size:</div>
      <Slider
        min={1}
        max={20}
        defaultValue={subjectPointSize}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: "100%" }}
      />
    </div>
  );
};

const MeanStrokeWidthSlider = () => {
  const dispatch = useDispatch();
  const meanStrokeWidth = useSelector(
    (state) => state.evolution.meanStrokeWidth
  );

  const onSliderComplete = (value) => {
    dispatch(setMeanStrokeWidth(value));
  };

  return (
    <div>
      <div>Mean Stroke Width:</div>
      <Slider
        min={1}
        max={30}
        defaultValue={meanStrokeWidth}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: "100%" }}
      />
    </div>
  );
};

const SubjectStrokeWidthSlider = () => {
  const dispatch = useDispatch();
  const subjectStrokeWidth = useSelector(
    (state) => state.evolution.subjectStrokeWidth
  );

  const onSliderComplete = (value) => {
    dispatch(setSubjectStrokeWidth(value));
  };

  return (
    <div>
      <div>Subject Stroke Width:</div>
      <Slider
        min={1}
        max={10}
        defaultValue={subjectStrokeWidth}
        onChangeComplete={onSliderComplete}
        step={1}
        style={{ width: "100%" }}
      />
    </div>
  );
};
