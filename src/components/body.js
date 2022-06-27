import React, { useEffect, useState } from "react";
import WelcomeView from "./welcome";
import TrainConfigForm from "./trainConfig/trainConfigForm";
import MetricsTable from "./metricsTable";
import LossChart from "./metricsChart";

const BodyComponent = (props) => {
  const [showStats, setShowStats] = useState(props.modelConfig.generations > 0);

  useEffect(() => {
    setShowStats(props.modelConfig.generations.length > 0);
  }, [props.modelConfig.generations]);

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
            <MetricsTable episodes={props.modelConfig.generations} />
            <LossChart episodes={props.modelConfig.generations} />
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
