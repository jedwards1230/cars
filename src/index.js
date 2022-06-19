import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { Tooltip } from 'bootstrap';

import NavComponent from './components/nav';
import BodyComponent from './components/body';

import { Environment } from "./car/environment.js";
import { Visualizer } from "./network/visualizer.js";
import { Car } from "./car/car.js";
import { train } from "./network/train.js";
import { ModelConfig } from './network/config';

// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// hook into DOM
const reactHeader = ReactDOM.createRoot(document.getElementById('reactHeader'));
const reactBody = ReactDOM.createRoot(document.getElementById('reactBody'));

// prepare guests
let welcomed = false;
const setWelcomed = (val) => welcomed = val;

// prepare road canvas
const carCanvas = document.getElementById("carCanvas");
carCanvas.height = 250;
const carCtx = carCanvas.getContext("2d");

// prepare visualizer canvas
const visualizer = new Visualizer();

// environment config
let env, model;
const trafficCount = 50;
const brainCount = 1;
let smartTraffic = false;

// init for training loop
let breakLoop = false;
let numSteps, numEpisodes, epsilonDecay;
let episodeCounter = 0;
let info;
let animFrame;

// init default config
let modelConfig = new ModelConfig("trainBrain", "fsd");
modelConfig.load();

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
function beginTrain(nEpisodes, nSteps, epDecay, lr, sensorCount, actionCount, layers) {
	// these params come form the form on the page
	numEpisodes = nEpisodes;
	numSteps = nSteps;
	epsilonDecay = epDecay;
	episodeCounter = 0;

	modelConfig = new ModelConfig("trainBrain", "fsd");
	modelConfig.learningRate = lr;
	modelConfig.layers = layers;
	modelConfig.sensorCount = sensorCount;
	modelConfig.actionCount = actionCount;
	modelConfig.name = "trainBrain";
	modelConfig.alias = "fsd";
	console.log("Model config inputs: ", modelConfig);

	// reset environment
	reset(false);

	// beging training loop
	console.log("Training | Episodes: ", numEpisodes, " | Steps: ", numSteps, " | Learning Rate: ", modelConfig.learningRate);
	episodeLoop();
}

// Run training loop
async function episodeLoop() {
	// good entries are models that are an improvement in the right direction.
	// these get saved for future generations to evolve from.
	const checkGoodEntry = () => {
		if (info.speed < 1) return false;
		//if (info.distance < 500) return false;
		if (info.distance > distanceMax * 0.9) return true;
		return false;
	};

	// mutate the weights slightly to help with diversity
	// this currently changes values halfway to the max episode count
	let mutateBrain = episodeCounter < numEpisodes / 2 ? 0.1 : 0.01;
	// (sike)
	mutateBrain = 0.01;
	model.brain.mutate(mutateBrain);

	// collect episode info for training run
	info = await train(model, env, numSteps);
	//info.episode = episodes.length + 1;

	// save max distance so we can mark model improvement
	// the main goal is distance without crashing
	const distanceMap = model.modelConfig.generations.map((e) => e.distance);
	const distanceMax = Math.max(...distanceMap, 500);

	// check if this is a good model
	info.goodEntry = checkGoodEntry(info);

	// save only if model is labelled an improvement
	if (distanceMax > 0 && info.goodEntry) {
		model.modelConfig.generations.push(info);
		modelConfig = model.saveModelConfig();
		console.log("Saving model: ", modelConfig);
		modelConfig.save();
	}

	// reset environment without breaking loop
	reset(false);


	// break loop if we've reached the max number of episodes
	episodeCounter++;
	if (episodeCounter >= numEpisodes || episodeCounter < 0)
		breakLoop = true;

	// if we're not breaking loop, continue training
	if (!breakLoop) {
		setTimeout(episodeLoop, 10);
	} else {
		console.log("training complete");
	}
}

/** Draw all cars in the environment, plus the model */
function drawCars() {
	carCtx.save();
	// translate based on model position.
	// this is basically the tracker, so any car can be dropped in here
	carCtx.translate(carCanvas.height * 0.7 - model.x, 0);
	env.road.draw(carCtx);
	for (let i = 0; i < env.traffic.length; i++) {
		env.traffic[i].draw(carCtx);
		carCtx.globalAlpha = 1;
	}
	model.draw(carCtx, true);
	carCtx.restore();
}

/** Toggle between training and visualizing network */
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

/** Reset environment and model
 * @param {boolean} breakL - whether to break the training loop
 */
function reset(breakL = true) {
	// break training loop
	breakLoop = breakL;
	if (breakL) episodeCounter = numEpisodes;

	// reset environment
	carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);
	env = new Environment(trafficCount, brainCount, carCanvas, smartTraffic);

	// reset model
	const x = 0;
	const y = env.road.getLaneCenter(env.startLane);
	model = new Car(-1, x, y, env.driverSpeed + 1, "network", "red");
	// load config from training form inputsmodelConfig.load();
	model.loadBrainConfig(modelConfig);

	// reset animation
	cancelAnimationFrame(animFrame);
	animate();
}


// Handle bootstrap tooltips
const tooltipTriggerList = document.querySelectorAll(
	'[data-bs-toggle="tooltip"]'
);
// eslint-disable-next-line no-unused-vars
const tooltipList = [...tooltipTriggerList].map(
	(tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
);

const destroyModel = () => {
	modelConfig.destroy();
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
	// not sure if i wanna toggle nav with the welcome screen or not
	if (welcomed) {
		reactHeader.render(
			<React.StrictMode>
				<NavComponent
					activeModel={modelConfig.name}
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
				model={model}
				modelConfig={modelConfig}
				generations={modelConfig.generations} />
		</React.StrictMode>
	);
}

// animate model
function animate(time) {
	// update cars
	env.update();
	// only perform action if car is not crashed
	if (!model.damaged) {
		//const observation = model.getObservation(env.road.borders, env.traffic);
		/* const sData = model.getSensorData(env.road.borders, env.traffic);
		const output = model.brain.forward(sData, true);
		const action = model.brain.makeChoice(output); */
		// lazy action to forward through network and make choice
		const action = model.lazyAction(env.road.borders, env.traffic, true);
		env.traffic = model.update(env.traffic, env.road.borders, action);
	}

	// draw cars, visualizer, and update UI
	env.canvas.width = window.innerWidth;
	drawCars();
	visualizer.draw(model.brain, time);
	drawUI();

	// reset animation on welcome screen when car crashes
	if (visualizer.active && model.damaged) setTimeout(reset, 0);

	// loop animation
	animFrame = requestAnimationFrame(animate);
}

// initial setting
reset();