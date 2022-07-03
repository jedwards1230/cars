import React from "react";
import NetworkCanvas from "./networkCanvas";
import { Environment } from "../car/environment";

const VisualView = (props: {
  env: Environment;
  animTime: number;
  reset: () => void;
}) => {
  return (
    <div>
      <NetworkCanvas
        model={props.env.getBestCar()}
        animTime={props.animTime}
        reset={props.reset} />
    </div>
  )
}

export default VisualView;