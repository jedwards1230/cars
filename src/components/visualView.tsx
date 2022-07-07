import React from "react";
import NetworkCanvas from "./networkCanvas";
import { SmartCar } from "../car/car";
import RoadCanvas from "./roadCanvas";
import { Simulator } from "../car/simulator";

const VisualView = (props: {
  sim: Simulator;
  bestCar: SmartCar;
  animTime: number;
  reset: () => void;
}) => {
  return (
    <div>
      <RoadCanvas
        sim={props.sim} />
      <NetworkCanvas
        bestCar={props.bestCar}
        animTime={props.animTime}
        reset={props.reset} />
    </div>
  )
}

export default VisualView;