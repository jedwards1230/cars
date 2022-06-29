import React from "react";
import RoadCanvas from "./roadCanvas";
import NetworkCanvas from "./networkCanvas";
import { Car } from "../car/car";
import { Environment } from "../car/environment";

const VisualView = (props: {
  model: Car;
  env: Environment;
  animTime: number;
  reset: () => void;
}) => {
  return (
    <div>
      <RoadCanvas
        model={props.model}
        env={props.env} />
      <NetworkCanvas
        model={props.model}
        animTime={props.animTime}
        reset={props.reset} />
    </div>
  )
}

export default VisualView;