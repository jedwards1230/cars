import React, { useState } from "react";
import './App.css';
import NavComponent from "./components/nav";
import WelcomeView from "./components/welcome";
import TrainView from "./components/trainView";
import VisualView from "./components/visualView";
import { ModelConfig } from "./network/config";
import { Simulator } from "./car/simulator";
import { Car } from "./car/car";

export const states = {
	welcome: "welcome",
	train: "train",
	visual: "visual",
	config: "config"
}

const App = (props: {
	beginTrain: () => void;
	reset: () => void;
	toggleView: () => void;
	modelConfig: ModelConfig;
	sim: Simulator;
	bestCar: Car;
	episodeCounter: number;
	animTime: number;
	activeModel: string;
	setActiveModel: (model: string) => void;
}) => {
	const [state, setState] = useState(states.welcome);

	const toggleView = () => {
		if (state === states.train) {
			setState(states.visual);
		} else if (state === states.visual) {
			setState(states.train);
		}
		props.toggleView();
	}

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
		toggleView={toggleView} />

	switch (state) {
		case states.welcome:
			return (
				<WelcomeView
					setState={setState} />
			)
		case states.train:
			return (
				<>
					{nav}
					<TrainView
						modelConfig={props.modelConfig}
						sim={props.sim}
						beginTrain={props.beginTrain}
						episodeCount={props.episodeCounter} />
				</>
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