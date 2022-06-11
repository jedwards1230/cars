import {
    Environment
} from "./utils/environment.js";
import {
    Visualizer
} from "./utils/visualizer.js";
import {
    Car
} from "./car/car.js";
import {
    train
} from "./network/train.js";
import {
    LossChart
} from "./utils/lossChart.js";
import {
    checkGoodEntry,
    save,
    load,
    destroy
} from "./utils/utils.js";

const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");
carCanvas.height = 300;
networkCanvas.height = 450;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const trafficCount = 50;
const brainCount = 1;

const lossChart = new LossChart();

let breakLoop = false;
let episodeCounter = 0;
let numEpisodes = 100;
let maxTimeSteps = 200;

let activeModel = "trainBrain"

let env = new Environment(trafficCount, brainCount, carCanvas);
const y = env.road.getLaneCenter(env.startLane)
let model = new Car(-1, 0, y, env.driverSpeed + 1, "network", "red");
model.addBrain("fsd", env);

let info;
let episodes = [];

let renderTrainEntries = false;
let visualizer = true;
let animFrame;

const modelData = load(activeModel);
if (modelData) {
    model.brain.loadBrain(modelData.brain);
    episodes = modelData.episodes;
    lossChart.chart.data = modelData.chartData;
}

// Set play view
function setPlayView() {
    if (visualizer) document.getElementById("networkCanvas").style.display = "inline";
    document.getElementById("train").style.display = "none";
}

// Set train view
function setTrainView() {
    document.getElementById("networkCanvas").style.display = "none";
    document.getElementById("train").style.display = "block";
}

// Prepare for training
function beginTrain() {
    document.getElementById("trainTableBody").replaceChildren();
    numEpisodes = document.getElementById("episodeCountInput").value - 1;
    maxTimeSteps = document.getElementById("timeLimitInput").value;

    document.getElementById("trainStats").style.display = "block";
    if (renderTrainEntries) document.getElementById("tableTrainEntries").style.display = "block";

    let goodEntriesBar = document.getElementById("goodEntriesBar");
    goodEntriesBar.style.width = "0%";

    let badEntriesBar = document.getElementById("badEntriesBar");
    badEntriesBar.style.width = "0%";

    episodeCounter = 0;

    reset();
    console.log("beginning training");
    breakLoop = false;
    episodeLoop();
}

// Run training loop
async function episodeLoop() {
    // mutate less over time
    let mutateBrain = episodeCounter < numEpisodes / 2 ? 0.005 : 0.001;
    model.brain.mutate(mutateBrain);

    // collect episode info
    info = await train(model, env, parseInt(maxTimeSteps));
    info.episode = episodes.length + 1;

    // find average of all distances for each episode
    if (episodes.length > 0) {
        const distances = episodes.map(e => e.distance);
        info.averageDistance = distances.reduce((a, b) => a + b) / distances.length;
    }

    info.goodEntry = checkGoodEntry(info);
    updateTrainStats();

    const distanceMap = episodes.map(e => e.distance);
    const distanceMax = Math.max(...distanceMap);

    episodes.push(info);

    // save only if model is better than average
    // todo: is this cheating or actually helpful?
    if (info.distance > info.averageDistance) save(activeModel, model.brain.save(), episodes, lossChart.save());

    reset();

    // reset environment with traffic using latest model
    /* if (episodeCounter % 10 == 0) {
        console.log("Smart traffic incoming...")
        env.reset(true)
    } */

    episodeCounter++;
    if (episodeCounter > numEpisodes || episodeCounter < 0) breakLoop = true;

    if (!breakLoop) {
        // set timeout to avoid stack overflow
        setTimeout(episodeLoop);
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
    drawVisualizer(time);
    animFrame = requestAnimationFrame(animate);
}

// Update training stats on page
function updateTrainStats() {
    // find min, max, and avg distance of all episodes
    const distanceMap = episodes.map(e => e.distance);
    const distanceMax = Math.max(...distanceMap);
    const distanceMin = Math.min(...distanceMap);
    const distanceAvg = episodes.reduce((a, e) => a + e.distance, 0) / episodes.length;

    // find min, max, and avg time of all episodes
    const timeMap = episodes.map(e => e.time);
    const timeMax = Math.max(...timeMap);
    const timeMin = Math.min(...timeMap);
    const timeAvg = episodes.reduce((a, e) => a + e.time, 0) / episodes.length;

    // find min, max, and avg loss of all episodes
    const lossMap = episodes.map(e => e.loss);
    const lossMax = Math.max(...lossMap);
    const lossMin = Math.min(...lossMap);
    const lossAvg = episodes.reduce((a, e) => a + e.loss, 0) / episodes.length;

    // find min, max, and avg speed of all episodes
    const speedMap = episodes.map(e => e.speed);
    const speedMax = Math.max(...speedMap);
    const speedMin = Math.min(...speedMap);
    const speedAvg = episodes.reduce((a, e) => a + e.speed, 0) / episodes.length;

    // update trainStatsTable
    document.getElementById("timeMax").innerHTML = timeMax.toFixed(0);
    document.getElementById("timeMin").innerHTML = timeMin.toFixed(0);
    document.getElementById("timeAvg").innerHTML = timeAvg.toFixed(0);
    document.getElementById("distanceMax").innerHTML = distanceMax.toFixed(0);
    document.getElementById("distanceMin").innerHTML = distanceMin.toFixed(0);
    document.getElementById("distanceAvg").innerHTML = distanceAvg.toFixed(0);
    document.getElementById("lossMax").innerHTML = lossMax.toFixed(4);
    document.getElementById("lossMin").innerHTML = lossMin.toFixed(4);
    document.getElementById("lossAvg").innerHTML = lossAvg.toFixed(4);
    document.getElementById("speedMax").innerHTML = speedMax.toFixed(2);
    document.getElementById("speedMin").innerHTML = speedMin.toFixed(2);
    document.getElementById("speedAvg").innerHTML = speedAvg.toFixed(2);

    if (renderTrainEntries) renderTrainStatsEntries();

    // update survivedBar
    const goodEntriesBar = document.getElementById("goodEntriesBar");
    const badEntriesBar = document.getElementById("badEntriesBar");
    // get how many episodes survived
    // episode survived if !damaged
    const goodEntries = episodes.filter(e => e.goodEntry == true).length;
    const badEntries = episodes.filter(e => e.goodEntry == false).length;
    goodEntriesBar.style.width = `${(goodEntries / episodes.length) * 100}%`;
    //goodEntriesBar.ariaValueNow = goodEntries;
    badEntriesBar.style.width = `${(badEntries / episodes.length) * 100}%`;
    //badEntriesBar.ariaValueNow = badEntries;
    document.getElementById("survivedCount").innerHTML = `Good Models: ${goodEntries}/${episodes.length + 1}`;

    // update Loss Chart
    lossChart.updateChart(info);
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

function drawVisualizer(time) {
    networkCtx.lineDashOffset = -time / 40;
    Visualizer.drawNetwork(networkCtx, model.brain)
}

function toggleView() {
    breakLoop = true;
    if (visualizer) {
        setPlayView();
    } else {
        setTrainView();
    }
}

function reset() {
    carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);

    env = new Environment(trafficCount, brainCount, carCanvas);
    const x = 0;
    const y = env.road.getLaneCenter(env.startLane)
    model = new Car(-1, x, y, env.driverSpeed + 1, "network", "red");
    model.addBrain("fsd", env);
    const modelData = load(activeModel);
    if (modelData) {
        model.brain.loadBrain(modelData.brain);
        episodes = modelData.episodes;
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
    save(activeModel, model.brain.save(), episodes, lossChart.save());
});
document.querySelector("#destroyBtn").addEventListener("click", function () {
    breakLoop = true;
    destroy(activeModel);
    episodes = [];
    lossChart.reset();
    document.getElementById("trainStats").style.display = "none";
    reset();
});
document.querySelector("#resetBtn").addEventListener("click", function () {
    breakLoop = true;
    reset();
});

document.querySelector("#toggleView").addEventListener("click", function () {
    visualizer = !visualizer;
    episodeCounter = numEpisodes;
    toggleView();
});

// init values
document.getElementById("episodeCountInput").value = numEpisodes;
document.getElementById("timeLimitInput").value = maxTimeSteps;
document.getElementById("activeModelName").innerHTML = activeModel;

function setMainView() {
    document.getElementById("carCanvas").style.display = "inline";
    document.getElementById("nav").style.display = "flex";
    document.getElementById("welcome").style.display = "none";

    reset();
    animate();
}

function renderTrainStatsEntries() {
    // find table for episode entries
    document.getElementById("trainStats").style.display = "block";
    let body = document.getElementById("trainTableBody");

    // create row
    let row = document.createElement("tr");
    row.id = info.episode - 1;
    // view brain on row click
    row.addEventListener("click", function (event) {
        console.log("episode: " + event.target.parentElement.id);
        console.table(episodes[event.target.parentElement.id].brain);
        console.table(episodes[event.target.parentElement.id].brain.biases);
    });

    // create damaged cell
    let damaged = document.createElement("td");
    damaged.innerHTML = info.damaged;
    if (info.damaged) damaged.style.fontWeight = "bold";
    if (info.damaged) {
        damaged.classList.add("table-danger");
    } else {
        damaged.classList.add("table-success");
    }

    // create time cell
    let time = document.createElement("td");
    time.innerHTML = info.time.toFixed(0);

    // create distance cell
    let distance = document.createElement("td");
    distance.innerHTML = info.distance.toFixed(0);
    if (info.distance <= 0) {
        distance.classList.add("table-danger");
    } else {
        distance.classList.add("table-success");
    }

    // create speed cell
    let speed = document.createElement("td");
    speed.innerHTML = info.speed;
    if (info.speed <= 0) {
        speed.classList.add("table-danger");
    } else {
        speed.classList.add("table-success");
    }

    // create loss cell
    let loss = document.createElement("td");
    loss.innerHTML = info.loss.toFixed(4);

    // create header
    let header = document.createElement("th");
    header.scope = "row";
    header.innerHTML = info.episode;
    if (!info.goodEntry) {
        header.classList.add("table-danger");
    } else {
        header.classList.add("table-success");
    }

    // add cells to row
    row.appendChild(header);
    row.appendChild(damaged);
    row.appendChild(time);
    row.appendChild(distance);
    row.appendChild(speed);
    row.appendChild(loss);

    // add row to table body
    body.appendChild(row);
}