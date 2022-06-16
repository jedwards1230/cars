//import logo from './logo.svg';
import './App.css';
import MainView from './components/mainView.js';
import { Environment } from './car/environment';
import { Car } from './car/car.js';
import { train } from "./network/train.js";
import { Tooltip } from 'bootstrap';
import React, { useEffect, useState, createContext } from "react";
import {
	saveModel,
	loadModel,
	saveEpisodes,
	loadEpisodes
} from "./utils.js";
import {
	Linear,
	Sigmoid,
	Relu,
	LeakyRelu,
	Tanh,
	SoftMax,
} from "./network/layers.js";

export const AppContext = createContext({
	env: null,
	setEnv: () => {},
	model: null,
	setModel: () => {},
	episodes: [],
	setEpisodes: () => {},
	frame: 0,
	setFrame: () => {},
});

const App = () => {
	const [trafficCount, setTrafficCount] = useState(50);
	const [brainCount, setBrainCount] = useState(1);
	const [smartTraffic, setSmartTraffic] = useState(true);

	const [breakLoop, setBreakLoop] = useState(false);
	const [episodeCounter, setEpisodeCounter] = useState(0);

	const [numEpisodes, setNumEpisodes] = useState(100);
	const [numSteps, setNumSteps] = useState(1000);

	const [actionCount, setActionCount] = useState(4);

	const activeLayers = () => [
		new Tanh(5, 10),
		new Sigmoid(10, actionCount),
	];

	const roadConfig = {
		y: 300 / 2,
		width: 300 * 0.9
	}

	const [activeModel, setActiveModel] = useState("trainBrain");

	const [env, setEnv] = useState(new Environment(trafficCount, brainCount, roadConfig, smartTraffic));
	const savedEpisodes = loadEpisodes(activeModel);
	const savedModel = loadModel(activeModel);

	const x = 0;
	const y = env.road.getLaneCenter(env.startLane);
	const [model, setModel] = useState(new Car(-1, x, y, env.driverSpeed + 1, "network", "red", actionCount));
	
	const initLayers = activeLayers();
	model.addBrain("fsd", env, initLayers);

	const [info, setInfo] = useState({});
	const [episodes, setEpisodes] = useState(savedEpisodes);
	if (!episodes) setEpisodes([]);

	const [animTime, setAnimTime] = useState(0);
	const [animFrame, setAnimFrame] = useState(null);
	const [frame, setFrame] = useState(0);

	const toggleView = () => {
		setBreakLoop(true);
		setEpisodeCounter(numEpisodes);
	}

	// Prepare for training
	const beginTrain = () => {
		setEpisodeCounter(0);

		console.log("beginning training");
		setBreakLoop(false);
		episodeLoop();
	}

	// Run training loop
	const episodeLoop = async () => {
		const checkGoodEntry = () => {
			if (info.speed < 1) return false;
			if (info.distance < 500) return false;
			if (info.distance > distanceMax * 0.9) return true;
			return false;
		};

		// mutate less over time
		let mutateBrain = episodeCounter < numEpisodes / 2 ? 0.1 : 0.01;
		mutateBrain = 0.01;
		model.brain.mutate(mutateBrain);

		// collect episode info
		setInfo(await train(model, env, numSteps));
		info.episode = episodes.length + 1;

		const distanceMap = episodes.map((e) => e.distance);
		const speedMap = episodes.map((e) => e.speed);
		const distanceMax = Math.max(...distanceMap);
		const speedAvg =
			speedMap.length > 0
				? speedMap.reduce((a, b) => a + b) / speedMap.length
				: 0;

		info.goodEntry = checkGoodEntry(info);
		setEpisodes([...episodes, info]);

		// save only if model is labelled an improvement
		if (distanceMax > 0 && info.goodEntry) {
			await saveModel(activeModel, model.brain.save());
		}
		saveEpisodes(activeModel, episodes);

		setEpisodeCounter(episodeCounter + 1);
		if (episodeCounter > numEpisodes || episodeCounter < 0)
			setBreakLoop(true);

		if (!breakLoop) {
			// set timeout to avoid stack overflow
			setTimeout(episodeLoop, 1);
		} else {
			console.log("training complete");
			const brain = info.model.save();
			console.log("weights");
			for (let i = 0; i < brain.weights.length; i++) {
				console.table(brain.weights[i]);
			}
			console.log("biases");
			console.table(brain.biases);
		}
	}

	const tooltipTriggerList = document.querySelectorAll(
		'[data-bs-toggle="tooltip"]'
	);
	const tooltipList = [...tooltipTriggerList].map(
		(tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
	);

	/* useEffect(() => {
        env.update();
        if (!model.damaged) {
            //const observation = model.getObservation(env.road.borders, env.traffic);
            const sData = model.getSensorData(env.road.borders, env.traffic);
            const output = model.brain.forward(sData, true);
            const action = model.brain.makeChoice(output);
            //const action = model.lazyAction(env.road.borders, env.traffic, true);
            env.traffic = model.update(env.traffic, env.road.borders, action);
        }
	}); */

	return (
		<AppContext.Provider value={{
			env: env,
			setEnv: setEnv,
			model: model,
			setModel: setModel,
			episodes: episodes,
			setEpisodes: setEpisodes,
			frame: frame,
			setFrame: setFrame,
		}}>
			<MainView
				activeModel={activeModel}
				beginTrain={beginTrain}
				animationTime={animTime}
				toggleView={toggleView}
				numEpisodes={numEpisodes}
				numSteps={numSteps} />
		</AppContext.Provider>
	)
}

export default App;
