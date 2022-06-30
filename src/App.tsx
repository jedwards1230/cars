import React, { useState } from "react";
import './App.css';
import NavComponent from "./components/nav";
import WelcomeView from "./components/welcome";
import TrainView from "./components/trainView";
import VisualView from "./components/visualView";
import { ModelConfig } from "./network/config";
import { Environment } from "./car/environment";
import { Car } from "./car/car";

const App = (props: {
	beginTrain: (config: ModelConfig) => void;
	reset: () => void;
	toggleView: () => void;
	modelConfig: ModelConfig;
	model: Car;
	env: Environment;
	episodeCounter: number;
	animTime: number;
}) => {
	const [showVisualizer, setShowVisualizer] = useState(false);
	const [welcomed, setWelcomed] = useState(false);

	const toggleView = () => {
		setShowVisualizer(!showVisualizer);
		props.toggleView();
	}

	const setTrain = () => {
		setShowVisualizer(false);
		props.reset();
	}

	const setVisuals = () => {
		setShowVisualizer(true);
		props.reset();
	}

	const destroyModel = () => {
		props.modelConfig.destroy();
		props.reset();
	}

	if (!welcomed) {
		return <WelcomeView
			setPlay={setVisuals}
			setTrain={setTrain}
			setWelcomed={setWelcomed}
		/>
	}

	const body = showVisualizer ?
		<VisualView
			animTime={props.animTime}
			model={props.model}
			env={props.env}
			reset={props.reset} /> :
		<TrainView
			modelConfig={props.modelConfig}
			model={props.model}
			env={props.env}
			beginTrain={props.beginTrain}
			episodeCount={props.episodeCounter} />

	return (
		<div>
			<NavComponent
				activeModel={props.modelConfig.name}
				model={props.model}
				destroy={destroyModel}
				reset={props.reset}
				toggleView={toggleView}
			/>
			{body}
		</div>
	)
};

export default App;