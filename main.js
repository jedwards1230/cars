import { Environment } from "./components/environment.js";
import { Visualizer } from "./components/visualizer.js";
import { LossChart } from "./components/lossChart.js";
import { MetricsTable } from "./components/metricsTable.js";
import { TrainForm } from "./components/trainForm.js";
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

const carCanvas = document.getElementById("carCanvas");
carCanvas.height = 250;

const carCtx = carCanvas.getContext("2d");

const trafficCount = 50;
const brainCount = 1;
let smartTraffic = true;

const visualizer = new Visualizer();
const lossChart = new LossChart();
const trainForm = new TrainForm();

let breakLoop = false;
let episodeCounter = 0;

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
    document.getElementById("train").style.display = "none";
    lossChart.hide();
}

// Set train view
function setTrainView() {
    document.getElementById("networkCanvas").style.display = "none";
    document.getElementById("train").style.display = "block";
    if (episodes.length > 0) {
        lossChart.draw(episodes);
        lossChart.show();
    } else {
        lossChart.hide();
    }
}

// Prepare for training
function beginTrain() {
    document.getElementById("trainTableBody").replaceChildren();
    trainForm.readInputs();

    document.getElementById("trainStats").style.display = "block";
    if (renderTrainEntries)
        document.getElementById("tableTrainEntries").style.display = "block";

    let goodEntriesBar = document.getElementById("goodEntriesBar");
    goodEntriesBar.style.width = "0%";

    let badEntriesBar = document.getElementById("badEntriesBar");
    badEntriesBar.style.width = "0%";

    episodeCounter = 0;

    reset();
    lossChart.hide();
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
        lossChart.draw(episodes);
        lossChart.show();
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

    document.getElementById("activeSpeedName").innerHTML = model.speed.toFixed(2);
    document.getElementById("activeDistanceName").innerHTML =
        model.distance.toFixed(0);

    // draw cars
    env.render();
    drawCars();
    visualizer.draw(model.brain, time);
    animFrame = requestAnimationFrame(animate);
}

// Update training stats on page
function updateTrainStats(episodes) {
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
    breakLoop = true;
    if (visualizer.active) {
        setPlayView();
    } else {
        setTrainView();
    }
}

function reset() {
    // reset environment
    carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);
    env = new Environment(trafficCount, brainCount, carCanvas, smartTraffic);

    // reset model
    const x = 0;
    const y = env.road.getLaneCenter(env.startLane);
    model = new Car(-1, x, y, env.driverSpeed + 1, "network", "red", actionCount);
    model.addBrain("fsd", env, activeLayers());

    // load saved data
    const modelBrain = loadModel(trainForm.activeModel);
    if (modelBrain) model.brain.loadBrain(modelBrain);
    const modelEpisodes = loadEpisodes(trainForm.activeModel);
    if (modelEpisodes) episodes = modelEpisodes;

    // reset animation
    cancelAnimationFrame(animFrame);
    animate();
}

const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

// init buttons
document.querySelector("#startTrain").addEventListener("click", function () {
    visualizer.active = false;
    setTrainView();
    setMainView();
});
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

document.querySelector("#toggleView").addEventListener("click", function () {
    visualizer.active = !visualizer.active;
    episodeCounter = trainForm.numEpisodes;
    toggleView();
});

trainForm.setValues();

function setMainView() {
    document.getElementById("carCanvas").style.display = "inline";
    document.getElementById("nav").style.display = "flex";
    document.getElementById("welcome").style.display = "none";

    reset();
    animate();
}
