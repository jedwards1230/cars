import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import { Tooltip } from 'bootstrap';

import { Environment } from "./car/environment.js";
import { Visualizer } from "./network/visualizer.js";
import { Car } from "./car/car.js";
import { train } from "./network/train.js";
import { defaultTrainBrain } from './network/network';
import NavComponent from './components/nav';
import BodyComponent from './components/body';
import {
	saveModel,
	loadModel,
	destroy,
	loadEpisodes,
	saveEpisodes,
} from "./utils.js";

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

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
let smartTraffic = false;

const visualizer = new Visualizer();

let breakLoop = false;
let numSteps, numEpisodes, epsilonDecay, learningRate;
let episodeCounter = 0;

const activeModel = "trainBrain";

let env, model;

let info;
let episodes = [];

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
function beginTrain(nEpisodes, nSteps, epDecay, lr, layers) {
	numEpisodes = nEpisodes;
	numSteps = nSteps;
	epsilonDecay = epDecay;
	learningRate = lr;
	episodeCounter = 0;
	console.log("Layer form: " + layers);
	console.log("Defauly config: " + defaultTrainBrain);

	reset(false);

	console.log("Training | Episodes: ", numEpisodes, " | Steps: ", numSteps, " | Decay: ", epsilonDecay, " | Learning Rate: ", learningRate);
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
	const distanceMax = Math.max(...distanceMap);

	info.goodEntry = checkGoodEntry(info);
	episodes.push(info);

	// save only if model is labelled an improvement
	if (distanceMax > 0 && info.goodEntry) {
		saveModel(activeModel, model.brain.saveBrain());
		saveEpisodes(activeModel, episodes);
	}
	reset(false);

	episodeCounter++;
	if (episodeCounter >= numEpisodes || episodeCounter < 0)
		breakLoop = true;

	if (!breakLoop) {
		setTimeout(episodeLoop, 10);
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
	if (breakL) episodeCounter = numEpisodes;
	// reset environment
	carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);
	env = new Environment(trafficCount, brainCount, carCanvas, smartTraffic);

	// reset model
	const x = 0;
	const y = env.road.getLaneCenter(env.startLane);
	model = new Car(-1, x, y, env.driverSpeed + 1, "network", "red");
	model.loadBrainConfig(defaultTrainBrain);

	// load saved model and episodes
	const savedModelConfig = loadModel(activeModel);
	if (savedModelConfig) model.loadBrainConfig(savedModelConfig)

	const savedEpisodes = loadEpisodes(activeModel);
	if (savedEpisodes) episodes = savedEpisodes;

	// reset animation
	cancelAnimationFrame(animFrame);
	animate();
}

const tooltipTriggerList = document.querySelectorAll(
	'[data-bs-toggle="tooltip"]'
);
// eslint-disable-next-line no-unused-vars
const tooltipList = [...tooltipTriggerList].map(
	(tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
);


const destroyModel = () => {
	episodes = [];
	destroy(activeModel);
	reset();
}

function setMainView() {
	document.getElementById("carCanvas").style.display = "inline";
	reset();
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
	if (true) {
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
		/* const sData = model.getSensorData(env.road.borders, env.traffic);
		const output = model.brain.forward(sData, true);
		const action = model.brain.makeChoice(output); */
		const action = model.lazyAction(env.road.borders, env.traffic, true);
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