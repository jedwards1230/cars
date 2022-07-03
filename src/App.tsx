import React, { useEffect, useState } from "react";
import './App.css';
import NavComponent from "./components/nav";
import RoadCanvas from "./components/roadCanvas";
import WelcomeView from "./components/welcome";
import TrainView from "./components/trainView";
import VisualView from "./components/visualView";
import { ModelConfig } from "./network/config";
import { Environment } from "./car/environment";

const App = (props: {
	beginTrain: (config: ModelConfig) => void;
	reset: () => void;
	toggleView: () => void;
	modelConfig: ModelConfig;
	env: Environment;
	episodeCounter: number;
	animTime: number;
}) => {
	const [showVisualizer, setShowVisualizer] = useState(false);
	const [welcomed, setWelcomed] = useState(false);
	const [bestCar, setBestCar] = useState(props.env.getBestCar());

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

	const saveModel = () => {
		props.modelConfig.save();
		props.reset();
	}

	useEffect(() => {
		setBestCar(props.env.getBestCar());
	}, [props.env]);

	if (!welcomed) {
		return <WelcomeView
			setPlay={setVisuals}
			setTrain={setTrain}
			setWelcomed={setWelcomed}
		/>
	}

	const nav = <NavComponent
		activeModel={props.modelConfig.name}
		model={bestCar}
		save={saveModel}
		destroy={destroyModel}
		reset={props.reset}
		toggleView={toggleView}
	/>

	const body = showVisualizer ?
		<VisualView
			animTime={props.animTime}
			env={props.env}
			reset={props.reset} /> :
		<TrainView
			modelConfig={props.modelConfig}
			env={props.env}
			beginTrain={props.beginTrain}
			episodeCount={props.episodeCounter} />

	return (
		<div>
			{nav}
			<RoadCanvas
				env={props.env} />
			{body}
		</div>
	)
};

export default App;