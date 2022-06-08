import {Environment} from "./utils/environment.js";
import {Visualizer} from "./utils/visualizer.js";
import {Car} from "./car/car.js";
import {train} from "./network/train.js";

const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");
carCanvas.height = 300;
networkCanvas.height = 450;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const trafficCount = 100;
const brainCount = 1;

let breakLoop = false;
let episodeCounter = 0;
let numEpisodes = 100;
let maxTimeSteps = 200;

let env = new Environment(trafficCount, brainCount, carCanvas);
const x = 100;
const y = env.road.getLaneCenter(env.startLane)
let model = new Car(-1, x, y, env.driverSpeed + 1, "network", "red");
model.addBrain("fsd", env);

let info;
let episodes = [];

let anim = true;
let animFrame;

// Set play view
function setPlayView() {
    document.body.style.overflow = "hidden";
    document.getElementById("welcome").style.display = "none";
    document.getElementById("play").style.display = "flex";
    document.getElementById("train").style.display = "none";
    document.getElementById("nav").style.display = "flex";
    document.getElementById("toggleView").innerHTML = "Train";
}

// Set train view
function setTrainView() {
    if(document.getElementById("0")) {
        document.body.style.overflow = "scroll";
    }
    document.getElementById("welcome").style.display = "none";
    document.getElementById("play").style.display = "none";
    document.getElementById("train").style.display = "block";
    document.getElementById("nav").style.display = "flex";
    document.getElementById("toggleView").innerHTML = "Play";

    document.getElementById("episodeCountInput").value = numEpisodes;
    document.getElementById("timeLimitInput").value = maxTimeSteps;

    //document.getElementById("inputNeuronsInput").value = model.brain.inputs.length;
    //document.getElementById("inputNeuronsInput").disabled = true;
}

// Prepare for training
function beginTrain() {
    document.body.style.overflow = "hidden";
    document.getElementById("trainTableBody").replaceChildren();
    numEpisodes = document.getElementById("episodeCountInput").value - 1;
    maxTimeSteps = document.getElementById("timeLimitInput").value;
    let progress = document.getElementById("trainProgress");

    progress.style.width = "0%";
    progress.ariaValueNow = 0;
    progress.ariaValueMax = numEpisodes;

    let survivedProgress = document.getElementById("survivedBar");
    survivedProgress.style.width = "0%";
    survivedProgress.ariaValueNow = 0;
    survivedProgress.ariaValueMax = episodes.length;

    episodes = [];
    episodeCounter = 0;

    reset();
    console.log("beginning training");
    breakLoop = false;
    episodeLoop();
}

// Run training loop
function episodeLoop() {
    // load training brain
    if(localStorage.getItem("trainBrain")) {
        model.brain.loadWeights(JSON.parse(localStorage.getItem("trainBrain")));
    }
    // mutate less over time
    const mutateBrain = 1 / (5 * (episodeCounter + 1));
    model.brain.mutate(mutateBrain);

    // collect episode info
    info = train(model, env, parseInt(maxTimeSteps));
    info.episode = episodeCounter + 1;

    info.speed = Math.max(...info.speeds);
    info.distance = info.distance;

    updateTrainStats();
    localStorage.setItem("trainBrain", JSON.stringify(info.brain));

    episodes.push(info);
    reset();
    episodeCounter++;
    if (episodeCounter > numEpisodes || episodeCounter < 0) breakLoop = true;

    //animFrame = requestAnimationFrame(episodeLoop);
    if(!breakLoop) {
        setTimeout(episodeLoop, 0);
    } else {
        console.log("training complete");
        console.log("weights");
        for(let i=0; i<info.brain.length; i++) {
            console.table(info.brain[i]);
        }
    }
}

// animate model
function animate(time) {
    // update cars
    env.update();
    if(!model.damaged) {
        const [observation, metrics] = model.getObservation(env.road.borders, env.traffic);
        const action = model.brain.selectAction(observation, true);
        env.traffic = model.update(env.traffic, env.road.borders, action);
    }

    // draw cars
    env.render();
    drawCars();
    drawVisualizer(time);
    animFrame = requestAnimationFrame(animate);
}

// Update training stats on page
function updateTrainStats() {
    document.body.style.overflow = "scroll";

    // style progress bar
    const progress = document.getElementById("trainProgress");
    progress.ariaValueNow = info.episode;
    progress.style.width = `${(info.episode / numEpisodes) * 100}%`;

    // update survivedBar
    const survivedBar = document.getElementById("survivedBar");
    // get how many episodes survived
    // episode survived if !damaged
    const survived = episodes.filter(episode => !episode.damaged).length;
    survivedBar.style.width = `${(survived / episodes.length) * 100}%`;
    survivedBar.ariaValueNow = survived;
    document.getElementById("survivedCount").innerHTML = `Models Survived: ${survived}/${episodes.length + 1}`;


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

    // find table for episode entries
    document.getElementById("trainStats").style.display = "block";
    let body = document.getElementById("trainTableBody");

    // create row
    let row = document.createElement("tr");
    row.id = info.episode - 1;
    // view brain on row click
    row.addEventListener("click", function(event) {
        console.log("episode: " + event.target.parentElement.id);
        console.table(episodes[event.target.parentElement.id].brain);
        console.table(episodes[event.target.parentElement.id].brain.biases);
    });

    // create header
    let header = document.createElement("th");
    header.scope = "row";
    header.innerHTML = info.episode;
    row.appendChild(header);

    // create cells
    let damaged = document.createElement("td");
    damaged.innerHTML = info.damaged;
    if(info.damaged) damaged.style.fontWeight="bold";
    if(info.damaged) {
        damaged.classList.add("bg-danger");
    } else {
        damaged.classList.add("bg-success");
    }
    row.appendChild(damaged);

    let time = document.createElement("td");
    time.innerHTML = info.time.toFixed(0);
    row.appendChild(time);

    let distance = document.createElement("td");
    distance.innerHTML = info.distance.toFixed(0);
    row.appendChild(distance);

    let speed = document.createElement("td");
    speed.innerHTML = info.speed;
    row.appendChild(speed);

    let loss = document.createElement("td");
    loss.innerHTML = info.loss.toFixed(4);
    row.appendChild(loss);

    body.appendChild(row);
}

function drawCars() {
    carCtx.save();
    carCtx.translate(carCanvas.height * 0.7 - model.x, 0);
    env.road.draw(carCtx);
    for(let i=0; i<env.traffic.length; i++) {
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
    cancelAnimationFrame(animFrame);
    breakLoop = true;
    if(anim) {
        setPlayView();
        reset();
        animate();
    } else {
        setTrainView();
    }
}

function reset() {
    carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);

    env = new Environment(trafficCount, brainCount, carCanvas);
    const x = 100;
    const y = env.road.getLaneCenter(env.startLane)
    model = new Car(-1, x, y, env.driverSpeed + 1, "network", "red");
    model.addBrain("fsd", env);
}

function save() {
    localStorage.setItem("trainBrain", JSON.stringify(model.brain.save()));
}

function destroy() {
    localStorage.removeItem("trainBrain");
}

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// init buttons
document.querySelector("#startTrain").addEventListener("click", function() {
    anim = false;
    setTrainView();
});
document.querySelector("#trainBtn").addEventListener("click", beginTrain);
document.querySelector("#startPlay").addEventListener("click", function() {
    anim = true;
    setPlayView();
    reset();
    animate();
});
document.querySelector("#saveBtn").addEventListener("click", save);
document.querySelector("#destroyBtn").addEventListener("click", destroy);
document.querySelector("#resetBtn").addEventListener("click", function() {
    breakLoop = true;
    toggleView();
});
document.querySelector("#endBtn").addEventListener("click", function() {
    env.end();
});

document.querySelector("#toggleView").addEventListener("click", function() {
    anim = !anim;
    episodeCounter = numEpisodes;
    toggleView();
});