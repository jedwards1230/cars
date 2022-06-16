import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';

import { Tooltip } from 'bootstrap';

import { Environment } from "./components/environment.js";
import { Visualizer } from "./components/visualizer.js";
import { Car } from "./car/car.js";
import { train } from "./network/train.js";
import {
	saveModel,
	loadModel,
	destroy,
	loadEpisodes,
	saveEpisodes,
} from "./utils.js";
import {
	Linear,
	Sigmoid,
	Relu,
	LeakyRelu,
	Tanh,
	SoftMax,
} from "./network/layers.js";
import NavComponent from './components/nav';
import BodyComponent from './components/body';

const reactHeader = ReactDOM.createRoot(document.getElementById('reactHeader'));
const reactBody = ReactDOM.createRoot(document.getElementById('reactBody'));

let welcomed = false;
const setWelcomed = (val) => {
	welcomed = val;
}

const carCanvas = document.getElementById("carCanvas");
carCanvas.height = 250;

const carCtx = carCanvas.getContext("2d");

const trafficCount = 50;
const brainCount = 1;
let smartTraffic = true;

const visualizer = new Visualizer();

let breakLoop = false;
let numSteps = 1000;
let numEpisodes = 1000;
let epsilonDecay = 0.99;
let learningRate = 0.01;
let episodeCounter = 0;

const activeModel = "trainBrain";

const actionCount = 4;
const activeLayers = () => [
	new Tanh(5, 10),
	new Tanh(10, 10),
	new LeakyRelu(10, 10),
	new Sigmoid(10, actionCount),
];

let env, model;

let info;
let episodes = [];

let renderTrainEntries = false;
let animFrame;

// Set play view
function setPlayView() {
	if (visualizer.active)
		document.getElementById("networkCanvas").style.display = "inline";
}

// Set train view
function setTrainView() {
	document.getElementById("networkCanvas").style.display = "none";
}

// Prepare for training
function beginTrain(nEpisodes, nSteps, epDecay, lr) {
	numEpisodes = nEpisodes;
	numSteps = nSteps;
	epsilonDecay = epDecay;
	learningRate = lr;

	episodeCounter = 0;

	reset();
	console.log("beginning training");
	breakLoop = false;
	episodeLoop();
}

// Run training loop
async function episodeLoop() {
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
	info = await train(model, env, numSteps);
	info.episode = episodes.length + 1;

	const distanceMap = episodes.map((e) => e.distance);
	const speedMap = episodes.map((e) => e.speed);
	const distanceMax = Math.max(...distanceMap);

	info.goodEntry = checkGoodEntry(info);
	episodes.push(info);

	// save only if model is labelled an improvement
	if (distanceMax > 0 && info.goodEntry) {
		await saveModel(activeModel, model.brain.save());
	}
	saveEpisodes(activeModel, episodes);
	reset(false);

	episodeCounter++;
	if (episodeCounter > numEpisodes || episodeCounter < 0)
		breakLoop = true;

	if (!breakLoop) {
		setTimeout(episodeLoop, 1);
	} else {
		console.log("training complete");
	}
}

function drawCars() {
	carCtx.save();
	carCtx.translate(carCanvas.height * 0.7 - model.x, 0);
	env.road.draw(carCtx);
	for (let i = 0; i < env.traffic.length; i++) {
		env.traffic[i].draw(carCtx);
		carCtx.globalAlpha = 1;
	}
	model.draw(carCtx, true);
	carCtx.restore();
}

function toggleView() {
	visualizer.active = !visualizer.active;
	episodeCounter = numEpisodes;
	breakLoop = true;
	if (visualizer.active) {
		setPlayView();
	} else {
		setTrainView();
	}
}

function reset(breakL = true) {
	breakLoop = breakL;
	// reset environment
	carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);
	env = new Environment(trafficCount, brainCount, carCanvas, smartTraffic);

	// reset model
	const x = 0;
	const y = env.road.getLaneCenter(env.startLane);
	model = new Car(-1, x, y, env.driverSpeed + 1, "network", "red", actionCount);
	model.addBrain("fsd", env, activeLayers());

	// load saved data
	const modelBrain = loadModel(activeModel);
	if (modelBrain) model.brain.loadBrain(modelBrain);
	const modelEpisodes = loadEpisodes(activeModel);
	if (modelEpisodes) episodes = modelEpisodes;

	// reset animation
	cancelAnimationFrame(animFrame);
	animate();
}

const tooltipTriggerList = document.querySelectorAll(
	'[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
	(tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
);


const destroyModel = () => {
	breakLoop = true;
	destroy(activeModel);
	episodes = [];
	document.getElementById("trainStats").style.display = "none";
	reset();
}

function setMainView() {
	document.getElementById("carCanvas").style.display = "inline";

	reset();
	animate();
}

const startTrain = () => {
	visualizer.active = false;
	setTrainView();
	setMainView();
}

const startVisualizer = () => {
	visualizer.active = true;
	setPlayView();
	setMainView();
}

const drawUI = () => {
	if (welcomed) {
		reactHeader.render(
			<React.StrictMode>
				<NavComponent
					activeModel={activeModel}
          model={model}
					destroy={destroyModel}
					reset={reset}
					toggleView={toggleView} />
			</React.StrictMode>
		);
	}

	reactBody.render(
		<React.StrictMode>
			<BodyComponent
				welcomed={welcomed}
				setWelcomed={setWelcomed}
				showVisualizer={visualizer.active}
				setTrain={startTrain}
				setPlay={startVisualizer}
				beginTrain={beginTrain}
				episodes={episodes} />
		</React.StrictMode>
	);
}

// animate model
function animate(time) {
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
	env.canvas.width = window.innerWidth;
	drawCars();
	visualizer.draw(model.brain, time);
	drawUI();

  if (!welcomed && model.damaged) setTimeout(reset, 0);

	animFrame = requestAnimationFrame(animate);
}

reset();