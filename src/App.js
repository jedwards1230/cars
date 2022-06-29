import React, { useEffect, useState } from "react";
import './App.css';
import NavComponent from "./components/nav";
import WelcomeView from "./components/welcome";
import TrainView from "./components/trainView";
import VisualView from "./components/visualView";

const App = (props) => {
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

	useEffect(() => {
		setShowVisualizer(props.showVisualizer);
	}, [props.showVisualizer]);

	if (welcomed && !showVisualizer) {
		return (
			<div>
				<NavComponent
					activeModel={props.modelConfig.name}
					model={props.model}
					destroy={props.destroyModel}
					reset={props.reset}
					toggleView={toggleView}
				/>
				<TrainView
					modelConfig={props.modelConfig}
					model={props.model}
					env={props.env}
					beginTrain={props.beginTrain}
					episodeCount={props.episodeCounter} />
			</div>
		)
	} else if (welcomed && showVisualizer) {
		return (
			<div>
				<NavComponent
					activeModel={props.modelConfig.name}
					model={props.model}
					destroy={props.destroyModel}
					reset={props.reset}
					toggleView={toggleView}
				/>
				<VisualView
					animTime={props.animTime}
					model={props.model}
					env={props.env}
					reset={props.reset} />
			</div>
		)
	} else if (!welcomed) {
		return (
			<div id="mainView">
				<WelcomeView
					setPlay={setVisuals}
					setTrain={setTrain}
					setWelcomed={setWelcomed}
				/>
			</div>
		)
	}
	return null
};

export default App;