//import logo from './logo.svg';
import './App.css';
import MainView from './components/mainView.js';
import { Visualizer } from './components/visualizer.js';
import LossChart from './components/lossChart.js';
import { Environment } from './components/environment';
import { Car } from './car/car.js';
import { train } from "./network/train.js";
import MetricsTable from './components/metricsTable.js';
import {Tooltip} from 'bootstrap';
import React, {useEffect, useState} from "react";
import { useCanvas } from './components/canvas.js';
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

const App = () => {
	const [trafficCount, setTrafficCount] = useState(50);
	const [brainCount, setBrainCount] = useState(1);
	const [smartTraffic, setSmartTraffic] = useState(true);

	//const [carCanvas, setCarCanvas] = useState(null);

	const visualizer = new Visualizer();
	//const lossChart = new LossChart();
	let trainForm;

	const [breakLoop, setBreakLoop] = useState(false);
	const [episodeCounter, setEpisodeCounter] = useState(0);

	const [actionCount, setActionCount] = useState(4);

	const activeLayers = () => [
		new Tanh(5, 10),
		new Tanh(10, 10),
		new LeakyRelu(10, 10),
		new Sigmoid(10, actionCount),
	];

	const carCanvas = useCanvas().current;

	const roadConfig = {
		y: 300 / 2,
		width: 300 * 0.9
	}

	const [activeModel, setActiveModel] = useState("trainBrain");

	const [env, setEnv] = useState(new Environment(trafficCount, brainCount, roadConfig, smartTraffic));
	const x = 0;
	const y = env.road.getLaneCenter(env.startLane);
	const [model, setModel] = useState(new Car(-1, x, y, env.driverSpeed + 1, "network", "red", actionCount));

	const [info, setInfo] = useState(null);
	const [episodes, setEpisodes] = useState([]);

	const [renderTrainEntries, setRenderTrainEntries] = useState(false);
	const [animFrame, setAnimFrame] = useState(null);

	// Prepare for training
	const beginTrain = () => {
		document.getElementById("trainStats").style.display = "block";
		if (renderTrainEntries)
			document.getElementById("tableTrainEntries").style.display = "block";

		let goodEntriesBar = document.getElementById("goodEntriesBar");
		goodEntriesBar.style.width = "0%";

		let badEntriesBar = document.getElementById("badEntriesBar");
		badEntriesBar.style.width = "0%";

		setEpisodeCounter(0);

		reset();
		//lossChart.hide();
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
		let mutateBrain = episodeCounter < trainForm.numEpisodes / 2 ? 0.1 : 0.01;
		mutateBrain = 0.01;
		model.brain.mutate(mutateBrain);

		// collect episode info
		info = await train(model, env, trainForm.numSteps);
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
			await saveModel(trainForm.activeModel, model.brain.save());
		}
		saveEpisodes(trainForm.activeModel, episodes);
		reset();

		episodeCounter++;
		if (episodeCounter > trainForm.numEpisodes || episodeCounter < 0)
			breakLoop = true;

		if (!breakLoop) {
			// set timeout to avoid stack overflow
			setTimeout(episodeLoop, 1);
		} else {
			// draw chart
			//lossChart.draw(episodes);
			//lossChart.show();
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

	// animate model
	const animate = (time) => {
		// update cars
		env.update();
		if (!model.damaged) {
			//const observation = model.getObservation(env.road.borders, env.traffic);
			const sData = model.getSensorData(env.road.borders, env.traffic);
			const output = model.brain.forward(sData, true);
			const action = model.brain.makeChoice(output);
			//const action = model.lazyAction(env.road.borders, env.traffic, true);
			env.traffic = model.update(env.traffic, env.road.borders, action);
		}

		// draw cars
		env.render();
		//drawCars();
		visualizer.draw(model.brain, time);
		animFrame = requestAnimationFrame(animate);
	}

	// Update training stats on page
	const updateTrainStats = (episodes) => {
		MetricsTable.update(episodes);

		// update survivedBar
		const goodEntriesBar = document.getElementById("goodEntriesBar");
		const badEntriesBar = document.getElementById("badEntriesBar");
		// get how many episodes survived
		const goodEntries = episodes.filter((e) => e.goodEntry == true).length;
		const badEntries = episodes.filter((e) => e.goodEntry == false).length;
		goodEntriesBar.style.width = `${(goodEntries / episodes.length) * 100}%`;
		badEntriesBar.style.width = `${(badEntries / episodes.length) * 100}%`;
		document.getElementById(
			"survivedCount"
		).innerHTML = `Good Models: ${goodEntries}/${episodes.length + 1}`;
	}

	const reset = () => {
		// reset environment
		//const carCtx = carCanvas.getContext("2d");
		//carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);

		// reset model
		const x = 0;
		const y = env.road.getLaneCenter(env.startLane);
		//setModel(new Car(-1, x, y, env.driverSpeed + 1, "network", "red", actionCount));
		model.addBrain("fsd", env, activeLayers());

		// load saved data
		const modelBrain = loadModel(activeModel);
		if (modelBrain) model.brain.loadBrain(modelBrain);
		const modelEpisodes = loadEpisodes(activeModel);
		if (modelEpisodes) setEpisodes(modelEpisodes);

		// reset animation
		//cancelAnimationFrame(animFrame);
		//animate();
	}

	const tooltipTriggerList = document.querySelectorAll(
		'[data-bs-toggle="tooltip"]'
	);
	const tooltipList = [...tooltipTriggerList].map(
		(tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
	);

	reset();

	return <MainView 
		model={model} 
		env={env}
		activeModel={activeModel}
		episodes={episodes} 
		beginTrain={beginTrain}
		carCanvas={carCanvas} />
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
