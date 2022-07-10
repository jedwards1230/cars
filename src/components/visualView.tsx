import React from "react";
import { Simulator } from "../car/simulator";
import NetworkCanvas from "./networkCanvas";
import RoadCanvas from "./roadCanvas";

const VisualView = (props: {
	sim: Simulator
}) => {

	return (
		<>
			<RoadCanvas 
				sim={props.sim} />
			<NetworkCanvas
				network={props.sim.getBestCar().brain} />
		</>
	)
}

export default VisualView;