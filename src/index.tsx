import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

import App from "./App";

import { Simulator } from "./car/simulator";
import { SGD } from "./network/train";
import { ModelConfig } from "./network/config";

const reactRoot = ReactDOM.createRoot(document.getElementById("root")!);

// simulator config
let sim: Simulator
const trafficCount = 50;
const brainCount = 300;
let smartTraffic = false;
//let teach = false;

// init for training loop
let numSteps: number;
let numEpisodes: number;
let animFrame: number;
let breakLoop = false;
let episodeCounter = 0;

// init default config
let modelConfig = new ModelConfig("trainBrain", "fsd");
modelConfig.load();

// Prepare for training. This is called when the user submits the train config form.
function beginTrain() {
	const generations = modelConfig.generations
	modelConfig = new ModelConfig("trainBrain", "fsd");
	modelConfig.load();

	numEpisodes = modelConfig.numEpisodes;
	numSteps = modelConfig.numSteps;
	episodeCounter = 0;
	modelConfig.generations = generations;
	modelConfig.save();
	console.log("Model config inputs: ", modelConfig);

	// beging training loop
	breakLoop = false;
	episodeLoop();
}

/** Run Training Loop
 * 1. Start with fresh simulator and model
 * 2. Mutate brain weights slightly
 * 3. Train model for a n steps
 * 4. Save the model as a new generation if it is an improvement
 * 5. Reset simulator and model
 * 6. Repeat until all episodes are done
 */
async function episodeLoop() {
	// reset simulator
	sim = new Simulator(trafficCount, 1, smartTraffic);

	const model = sim.smartCars[0];

	// collect episode info for training run
	//const info = await SGD(model, sim, numSteps);
	const info = await SGD(model, sim, numSteps);

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
		model.saveModelConfig(info);
	}

	// break loop if we've reached the max number of episodes
	episodeCounter++;
	if (episodeCounter >= numEpisodes || episodeCounter < 0) breakLoop = true;

	// if we're not breaking loop, continue training
	if (breakLoop) {
		console.log("training complete after ", episodeCounter, " episodes");
		episodeCounter = 0;
		reset(false);
	} else {
		setTimeout(episodeLoop, 10);
	}
}

/** Reset simulator and model */
function reset(breakL = true) {
	// break training loop
	breakLoop = breakL;
	if (breakL) episodeCounter = numEpisodes;

	// reset simulator
	sim = new Simulator(trafficCount, brainCount, smartTraffic);

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
	sim.update();

	reactRoot.render(
		<React.StrictMode>
			<App
				beginTrain={beginTrain}
				reset={reset}
				toggleView={toggleView}
				animTime={time}
				episodeCounter={episodeCounter}
				modelConfig={modelConfig}
				sim={sim}
				bestCar={sim.getBestCar()}
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
