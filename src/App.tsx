import React, { useState } from "react";
import './App.css';
import NavComponent from "./components/nav";
import WelcomeView from "./components/welcome";
import TrainView from "./components/trainView";
import VisualView from "./components/visualView";

const App = (props: {
	toggleView: () => void;
	reset: () => void;
	beginTrain: any;
	modelConfig: any;
	model: any;
	destroyModel: any;
	env: any;
	episodeCounter: any;
	animTime: any;
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
				destroy={props.destroyModel}
				reset={props.reset}
				toggleView={toggleView}
			/>
			{body}
		</div>
	)
};

export default App;