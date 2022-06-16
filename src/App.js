//import logo from './logo.svg';
import './App.css';
import MainView from './components/mainView.js';
import { Environment } from './components/environment';
import { Car } from './car/car.js';
import { train } from "./network/train.js";
import MetricsTable from './components/metricsTable.js';
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
	const x = 0;
	const y = env.road.getLaneCenter(env.startLane);
	const [model, setModel] = useState(new Car(-1, x, y, env.driverSpeed + 1, "network", "red", actionCount));
	const initLayers = activeLayers();
	model.addBrain("fsd", env, initLayers);

	const [info, setInfo] = useState(null);
	const [episodes, setEpisodes] = useState([]);

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
		episodes.push(info);
		updateTrainStats(episodes);

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

	// Update training stats on page
	const updateTrainStats = (episodes) => {
		MetricsTable.update(episodes);

		// update survivedBar
		const goodEntriesBar = document.getElementById("goodEntriesBar");
		const badEntriesBar = document.getElementById("badEntriesBar");
		// get how many episodes survived
		const goodEntries = episodes.filter((e) => e.goodEntry === true).length;
		const badEntries = episodes.filter((e) => e.goodEntry === false).length;
		goodEntriesBar.style.width = `${(goodEntries / episodes.length) * 100}%`;
		badEntriesBar.style.width = `${(badEntries / episodes.length) * 100}%`;
		document.getElementById(
			"survivedCount"
		).innerHTML = `Good Models: ${goodEntries}/${episodes.length + 1}`;
	}

	const tooltipTriggerList = document.querySelectorAll(
		'[data-bs-toggle="tooltip"]'
	);
	const tooltipList = [...tooltipTriggerList].map(
		(tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
	);

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
				episodes={episodes}
				beginTrain={beginTrain}
				animationTime={animTime}
				toggleView={toggleView}
				numEpisodes={numEpisodes}
				numSteps={numSteps} />
		</AppContext.Provider>
	)
}



// init buttons
/* 

document.querySelector("#trainBtn").addEventListener("click", beginTrain);
document.querySelector("#startPlay").addEventListener("click", function () {
	visualizer.active = true;
	setPlayView();
	setMainView();
});
document.querySelector("#saveBtn").addEventListener("click", function () {
	saveModel(trainForm.activeModel, model.brain.save(), episodes);
});
document.querySelector("#destroyBtn").addEventListener("click", function () {
	breakLoop = true;
	destroy(trainForm.activeModel);
	episodes = [];
	lossChart.reset();
	document.getElementById("lossChart").style.display = "none";
	document.getElementById("trainStats").style.display = "none";
	reset();
});
document.querySelector("#resetBtn").addEventListener("click", function () {
	breakLoop = true;
	reset();
});

*/

export default App;
