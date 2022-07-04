import React, { useState } from "react";
import './App.css';
import NavComponent from "./components/nav";
import WelcomeView from "./components/welcome";
import VisualView from "./components/visualView";
import { AppConfig } from "./network/config";
import { Simulator } from "./car/simulator";
import { Car } from "./car/car";

export const states = {
	welcome: "welcome",
	visual: "visual",
	play: "play",
	config: "config"
}

const App = (props: {
	beginTrain: () => void;
	reset: () => void;
	toggleView: () => void;
	startPlay: () => void;
	modelConfig: AppConfig;
	sim: Simulator;
	bestCar: Car;
	episodeCounter: number;
	animTime: number;
	activeModel: string;
	setActiveModel: (model: string) => void;
}) => {
	const [state, setState] = useState(states.visual);

	const destroyModel = () => {
		props.modelConfig.destroy();
		props.reset();
	}

	const saveModel = () => {
		props.bestCar.saveModelConfig();
		props.reset();
	}

	const nav = <NavComponent
		modelConfig={props.modelConfig}
		model={props.bestCar}
		sim={props.sim}
		state={state}
		activeModel={props.activeModel}
		setActiveModel={props.setActiveModel}
		save={saveModel}
		destroy={destroyModel}
		reset={props.reset}
		startPlay={props.startPlay} />

	switch (state) {
		case states.welcome:
			return (
				<WelcomeView
					setState={setState} />
			)
		case states.visual:
			return (
				<>
					{nav}
					<VisualView
						animTime={props.animTime}
						sim={props.sim}
						bestCar={props.bestCar}
						reset={props.reset} />
				</>
			)
		default:
			return <div>Error</div>
	}
};

export default App;