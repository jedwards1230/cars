import {
    Environment
} from "./components/environment.js";
import {
    Visualizer
} from "./components/visualizer.js";
import {
    Car
} from "./car/car.js";
import {
    train
} from "./network/train.js";
import {
    LossChart
} from "./components/lossChart.js";
import {
    save,
    load,
    destroy
} from "./utils.js";
import {
    Linear,
    Sigmoid,
    Relu,
    LeakyRelu,
    Tanh,
    SoftMax
} from "../network/layers.js";
import {
    MetricsTable
} from "./components/metricsTable.js";
import {
    TrainForm
} from "./components/trainForm.js";

const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");
carCanvas.height = 300;
networkCanvas.height = 450;

const carCtx = carCanvas.getContext("2d");

const trafficCount = 50;
const brainCount = 1;
let smartTraffic = false;

const lossChart = new LossChart();

let breakLoop = false;
let episodeCounter = 0;

const trainForm = new TrainForm();

const actionCount = 4;
const activeLayers = [
    new Tanh(6, 6),
    new LeakyRelu(6, 5),
    new Sigmoid(5, actionCount),
];

let env, model;

let info;
let episodes = [];

let renderTrainEntries = false;
let visualizer = true;
let animFrame;

// Set play view
function setPlayView() {
    if (visualizer) document.getElementById("networkCanvas").style.display = "inline";
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
    if (renderTrainEntries) document.getElementById("tableTrainEntries").style.display = "block";

    let goodEntriesBar = document.getElementById("goodEntriesBar");
    goodEntriesBar.style.width = "0%";

    let badEntriesBar = document.getElementById("badEntriesBar");
    badEntriesBar.style.width = "0%";

    episodeCounter = 0;

    reset(true);
    console.log("beginning training");
    breakLoop = false;
    episodeLoop();
}

// Run training loop
async function episodeLoop() {
    // mutate less over time
    let mutateBrain = episodeCounter < trainForm.numEpisodes / 2 ? 0.1 : 0.01;
    //mutateBrain = 0.01;
    model.brain.mutate(mutateBrain);

    // collect episode info
    info = await train(model, env, trainForm.numSteps);
    info.episode = episodes.length + 1;

    // find average of all distances for each episode
    if (episodes.length > 0) {
        const distances = episodes.map(e => e.distance);
        info.averageDistance = distances.reduce((a, b) => a + b) / distances.length;
    }

    const checkGoodEntry = () => {
        if (info.speed <= 0) return false;
        if (info.distance < 800) return false;
        if (info.distance > (distanceMax * 0.9)) return true;
        if (info.loss < 0.01) return true;
        return false;
    }

    const distanceMap = episodes.map(e => e.distance);
    const distanceMax = Math.max(...distanceMap);
    const speedMap = episodes.map(e => e.speed);
    let speedAvg;
    if (speedMap.length > 0) {
        speedAvg = speedMap.reduce((a, b) => a + b) / speedMap.length;
    } else {
        speedAvg = 0;
    }

    info.goodEntry = checkGoodEntry(info);
    episodes.push(info);
    updateTrainStats();

    // save only if model is better than average
    if (distanceMax > 0 && info.goodEntry) {
        save(trainForm.activeModel, model.brain.save(), episodes);
        reset();
    } else {
        reset(true);
    }


    episodeCounter++;
    if (episodeCounter > trainForm.numEpisodes || episodeCounter < 0) breakLoop = true;

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
        const [observation, metrics] = model.getObservation(env.road.borders, env.traffic);
        const actionValues = model.brain.forward(observation);
        const action = model.brain.makeChoice(actionValues);
        env.traffic = model.update(env.traffic, env.road.borders, action);
    }

    document.getElementById("activeSpeedName").innerHTML = model.speed.toFixed(2);
    document.getElementById("activeDistanceName").innerHTML = model.distance.toFixed(0);

    // draw cars
    env.render();
    drawCars();
    Visualizer.draw(model.brain, time);
    animFrame = requestAnimationFrame(animate);
}

// Update training stats on page
function updateTrainStats() {
    MetricsTable.update(episodes);

    // update survivedBar
    const goodEntriesBar = document.getElementById("goodEntriesBar");
    const badEntriesBar = document.getElementById("badEntriesBar");
    // get how many episodes survived
    // episode survived if !damaged
    const goodEntries = episodes.filter(e => e.goodEntry == true).length;
    const badEntries = episodes.filter(e => e.goodEntry == false).length;
    goodEntriesBar.style.width = `${(goodEntries / episodes.length) * 100}%`;
    badEntriesBar.style.width = `${(badEntries / episodes.length) * 100}%`;
    document.getElementById("survivedCount").innerHTML = `Good Models: ${goodEntries}/${episodes.length + 1}`;
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
    if (visualizer) {
        setPlayView();
    } else {
        setTrainView();
    }
}

function reset(newCar = true) {
    carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);

    env = new Environment(trafficCount, brainCount, carCanvas, smartTraffic);
    const x = 0;
    const y = env.road.getLaneCenter(env.startLane)
    if (newCar) {
        model = new Car(-1, x, y, env.driverSpeed + 1, "network", "red", actionCount);
        model.addBrain("fsd", env, activeLayers);
        const modelData = load(trainForm.activeModel);
        if (modelData) {
            model.brain.loadBrain(modelData.brain);
            episodes = modelData.episodes;
        }
    } else {
        model.reset(x, y);
    }

    cancelAnimationFrame(animFrame);
    animate();
}

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// init buttons
document.querySelector("#startTrain").addEventListener("click", function () {
    visualizer = false;
    setTrainView();
    setMainView()
});
document.querySelector("#trainBtn").addEventListener("click", beginTrain);
document.querySelector("#startPlay").addEventListener("click", function () {
    visualizer = true;
    setPlayView();
    setMainView()
});
document.querySelector("#saveBtn").addEventListener("click", function () {
    save(trainForm.activeModel, model.brain.save(), episodes);
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
    visualizer = !visualizer;
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