import React, { useEffect, useState } from "react";
import WelcomeView from "./welcome";
import TrainConfigForm from "./trainConfig/trainConfigForm";
import MetricsTable from "./metricsTable";
import LossChart from "./metricsChart";
import { Car } from "../car/car";

const BodyComponent = (props: {
  generations: any;
  welcomed: any;
  model: Car;
  showVisualizer: any;
  beginTrain: any;
  modelConfig: any;
  episodeCounter: any;
  setPlay: any;
  setTrain: any;
  setWelcomed: any;
}) => {
  const [showStats, setShowStats] = useState(props.generations > 0);

  useEffect(() => {
    setShowStats(props.generations.length > 0);
  }, [props.generations]);

  if (props.welcomed && !props.showVisualizer) {
    return (
      <div id="mainView">
        <TrainConfigForm
          beginTrain={props.beginTrain}
          modelConfig={props.modelConfig}
          episodeCounter={props.episodeCounter}
        />
        {showStats && (
          <div id="trainStats" className=" py-2 my-2">
            <h5 className="p-3 text-center">Training Stats</h5>
            <MetricsTable episodes={props.generations} />
            <LossChart episodes={props.generations} />
          </div>
        )}
      </div>
    )
  } else if (!props.welcomed) {
    return (
      <div id="mainView">
        <WelcomeView
          setPlay={props.setPlay}
          setTrain={props.setTrain}
          setWelcomed={props.setWelcomed}
        />
      </div>
    )
  } 
  return null
};

export default BodyComponent;
