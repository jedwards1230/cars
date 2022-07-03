import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

import App from "./App";

import { Environment } from "./car/environment";
import { SGD } from "./network/train";
import { ModelConfig } from "./network/config";
import { Network } from "./network/network";

const reactRoot = ReactDOM.createRoot(document.getElementById("root")!);

// environment config
let env: Environment

const trafficCount = 50;
const brainCount = 1;
let smartTraffic = false;
//let teach = false;

// init for training loop
let numSteps: number;
let numEpisodes: number;
let info: {
	speed: number;
	distance: number;
	time?: number;
	loss?: number;
	damaged?: boolean;
	model?: Network;
};
let animFrame: number;
let animTime: number;
let breakLoop = false;
let episodeCounter = 0;

// init default config
let modelConfig = new ModelConfig("trainBrain", "fsd");
modelConfig.load();

// Prepare for training. This is called when the user submits the train config form.
function beginTrain(config: ModelConfig) {
	// these params come form the form on the page
	numEpisodes = config.numEpisodes;
	numSteps = config.numSteps;
	episodeCounter = 0;

	const generations = modelConfig.generations
	modelConfig = config;
	modelConfig.generations = generations;
	modelConfig.save();
	console.log("Model config inputs: ", modelConfig);

	// beging training loop
	console.log(
		"Training | Episodes: ",
		numEpisodes,
		" | Steps: ",
		numSteps,
		" | Learning Rate: ",
		modelConfig.lr
	);
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

	const model = env.brains[0];

	// mutate the weights slightly to help with diversity
	model.brain.mutate(modelConfig.mutationRate);

	// collect episode info for training run
	//info = await SGD(model, env, numSteps);
	info = await SGD(model, env, numSteps);

	// save max distance so we can mark model improvement
	// the main goal is distance without crashing
	const distanceMap = model.modelConfig.generations.map(
		(e: { distance: number }) => e.distance
	);
	const distanceMax = Math.max(...distanceMap, 1000);

	// good entries are models that are an improvement in the right direction.
	// these get saved for future generations to evolve from.
	const checkGoodEntry = (info: any) => {
		if (info.speed < 0) return false;
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
	if (episodeCounter >= numEpisodes || episodeCounter < 0) breakLoop = true;

	// if we're not breaking loop, continue training
	if (!breakLoop) {
		setTimeout(episodeLoop, 10);
	} else {
		console.log("training complete");
		episodeCounter = 0;
		reset(false);
	}
}

/** Reset environment and model */
function reset(breakL = true) {
	// break training loop
	breakLoop = breakL;
	if (breakL) episodeCounter = numEpisodes;

	// reset environment
	env = new Environment(trafficCount, brainCount, smartTraffic);

	// reset animation
	cancelAnimationFrame(animFrame);
	animate();
}

/** Toggle between training and visualizing network */
function toggleView() {
	episodeCounter = numEpisodes;
	breakLoop = true;
}

// animate model
function animate(time: number = 0) {
	animTime = time;

	// update cars
	env.update();

	reactRoot.render(
		<React.StrictMode>
			<App
				beginTrain={beginTrain}
				reset={reset}
				toggleView={toggleView}
				animTime={animTime}
				episodeCounter={episodeCounter}
				modelConfig={modelConfig}
				env={env}
			/>
		</React.StrictMode>
	);

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
