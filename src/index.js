import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import NavComponent from './components/nav';
import BodyComponent from './components/body';

import { Environment } from "./car/environment.js";
import { Visualizer } from "./network/visualizer.js";
import { Car } from "./car/car.js";
import { train } from "./network/train.js";
import { ModelConfig } from './network/config';

// hook into DOM
const reactHeader = ReactDOM.createRoot(document.getElementById('reactHeader'));
const reactBody = ReactDOM.createRoot(document.getElementById('reactBody'));

// prepare guests
let welcomed = false;
const setWelcomed = (val) => welcomed = val;

// prepare canvases
const carCanvas = document.getElementById("carCanvas");
const carCtx = carCanvas.getContext("2d");
const visualizer = new Visualizer();

// environment config
let env, model;
const trafficCount = 50;
const brainCount = 1;
let smartTraffic = false;

// init for training loop
let numSteps, numEpisodes, info, animFrame;
let breakLoop = false;
let episodeCounter = 0;

// init default config
const modelConfig = new ModelConfig("trainBrain", "fsd");
modelConfig.load();

// Prepare for training. This is called when the user submits the train config form.
function beginTrain(config) {
	// these params come form the form on the page
	numEpisodes = config.numEpisodes;
	numSteps = config.numSteps;
	episodeCounter = 0;

	modelConfig.learningRate = config.learningRate;
	modelConfig.epsilonDecay = config.epsilonDecay;
	modelConfig.mutationRate = config.mutationRate;
	modelConfig.layers = config.layers;
	modelConfig.sensorCount = config.sensorCount;
	modelConfig.actionCount = config.actionCount;
	modelConfig.name = "trainBrain";
	modelConfig.alias = "fsd";
	modelConfig.save();
	console.log("Model config inputs: ", modelConfig);

	// beging training loop
	console.log("Training | Episodes: ", numEpisodes, " | Steps: ", numSteps, " | Learning Rate: ", modelConfig.learningRate);
	episodeLoop();
}

/** Run Training Loop
 * 1. Start with fresh environment and model
 * 2. Mutate brain weights slightly
 * 3. Train model for a n steps
 * 4. Save the model as a new generation if it is an improvement
 * 5. Reset environment and model
 * 6. Repeat until all episodes are done
 */
async function episodeLoop() {
	// reset environment
	reset(false);

	// mutate the weights slightly to help with diversity
	model.brain.mutate(modelConfig.mutationRate);

	// collect episode info for training run
	info = await train(model, env, numSteps);

	// save max distance so we can mark model improvement
	// the main goal is distance without crashing
	const distanceMap = model.modelConfig.generations.map((e) => e.distance);
	const distanceMax = Math.max(...distanceMap, 1000);

	// good entries are models that are an improvement in the right direction.
	// these get saved for future generations to evolve from.
	const checkGoodEntry = () => {
		if (info.speed < 1) return false;
		if (info.distance > distanceMax * 0.9) return true;
		return false;
	};

	// save only if model is labelled an improvement
	if (checkGoodEntry(info)) {
		model.modelConfig.generations.push(info);
		model.saveModelConfig();
	}

	// break loop if we've reached the max number of episodes
	episodeCounter++;
	if (episodeCounter >= numEpisodes || episodeCounter < 0)
		breakLoop = true;

	// if we're not breaking loop, continue training
	if (!breakLoop) {
		setTimeout(episodeLoop, 10);
	} else {
		console.log("training complete");
		episodeCounter = 0;
		reset(false);
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
	const y = env.road.getLaneCenter(1);
	model = new Car(-1, x, y, env.driverSpeed + 1, "network", "red");
	// load saved config
	modelConfig.load();
	model.loadBrainConfig(modelConfig);

	// reset animation
	cancelAnimationFrame(animFrame);
	animate();
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
	}
	model.draw(carCtx, true);
	carCtx.restore();
}

// Set play view
function setPlayView() {
	if (visualizer.active)
		document.getElementById("networkCanvas").style.display = "inline";
}

// Set train view
function setTrainView() {
	document.getElementById("networkCanvas").style.display = "none";
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

	const generations = model.modelConfig.generations;
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
				episodeCounter={episodeCounter}
				modelConfig={modelConfig}
				generations={generations} />
		</React.StrictMode>
	);
}

// animate model
function animate(time) {
	// update cars
	env.update();
	// only perform action if car is not crashed
	if (!model.damaged) {
		const action = model.lazyAction(env.road.borders, env.traffic, true);
		model.update(env.traffic, env.road.borders, action);
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

// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// initial setting
reset();