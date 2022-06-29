import React, { useEffect, useState } from "react";
import TrainConfigForm from "./trainConfig/trainConfigForm";
import MetricsTable from "./metricsTable";
import LossChart from "./metricsChart";
import RoadCanvas from "./roadCanvas";

import { Car } from "../car/car";
import { Environment } from "../car/environment";

const TrainView = (props: {
  beginTrain: () => void;
  modelConfig: any;
  model: Car;
  env: Environment;
  episodeCount: number;
}) => {
  const [showStats, setShowStats] = useState(props.modelConfig.generations.length > 0);

  useEffect(() => {
    setShowStats(props.modelConfig.generations.length > 0);
  }, [props.modelConfig.generations]);

  return (
    <div>
      <RoadCanvas
        model={props.model}
        env={props.env} />
      <TrainConfigForm
        beginTrain={props.beginTrain}
        modelConfig={props.modelConfig}
        episodeCounter={props.episodeCount}
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
}

export default TrainView;