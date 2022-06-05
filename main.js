import {Environment} from "./utils/environment.js";
import {Visualizer} from "./utils/visualizer.js";
import {Car} from "./car/car.js";
import {train} from "./train.js";

const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");

carCanvas.width = 300;
networkCanvas.width = 450;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const trafficCount = 100;
const brainCount = 1;

let episodeCounter = 0;
let numEpisodes = 1;
let maxTimeSteps = 21;

let env =new Environment(trafficCount, brainCount, carCanvas);
let model = new Car(-1, env.road.getLaneCenter(env.startLane), 100, env.driverSpeed + 1, "network", "red");
model.addBrain("fsd", env);
let info;
let episodes = [];

let anim = true;
let animFrame;

handleButtons();

function animate(time) {
    // update cars
    env.update();
    if(!model.damaged) {
        const observation = model.getSensorData(env.road.borders, env.traffic);
        const action = model.brain.selectAction(observation);
        model.updateControls(action);
        env.traffic = model.update(env.road.borders, env.traffic);
    }

    // draw cars
    env.render();
    drawCars();
    drawVisualizer(time);
    animFrame = requestAnimationFrame(animate);
}

function drawCars() {
    carCtx.save();
    carCtx.translate(0, carCanvas.height * 0.7 - model.y);
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

function setPlayView() {
    document.body.style.overflow = "hidden";
    document.getElementById("welcome").style.display = "none";
    document.getElementById("play").style.display = "flex";
    document.getElementById("train").style.display = "none";
    document.getElementById("nav").style.display = "flex";
    document.getElementById("toggleView").innerHTML = "Train";
}

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
}

function toggleView() {
    cancelAnimationFrame(animFrame);
    if(anim) {
        setPlayView();
        reset();
        animate();
    } else {
        setTrainView();
    }
}

function handleButtons() {
    document.querySelector("#saveBtn").addEventListener("click", save);
    document.querySelector("#destroyBtn").addEventListener("click", destroy);
    document.querySelector("#resetBtn").addEventListener("click", reset);
    document.querySelector("#trainBtn").addEventListener("click", beginTrain);
    document.querySelector("#endBtn").addEventListener("click", function() {
        env.end();
    });
    document.querySelector("#startTrain").addEventListener("click", function() {
        anim = false;
        setTrainView();
    });
    document.querySelector("#startPlay").addEventListener("click", function() {
        anim = true;
        setPlayView();
        reset();
        animate();
    });
    document.querySelector("#toggleView").addEventListener("click", function() {
        anim = !anim;
        toggleView();
    });
}

function updateTrainStats() {
    document.body.style.overflow = "scroll";
    const progress = document.getElementById("trainProgress");
    progress.ariaValueNow = info.episode;
    if(episodeCounter < numEpisodes - 1) {
        progress.style.width = `${(info.episode / numEpisodes) * 100}%`;
    } else {
        progress.style.width = "0%";
    }

    document.getElementById("trainStats").style.display = "block";
    let body = document.getElementById("trainTableBody");

    let row = document.createElement("tr");
    row.id = info.episode - 1;
    row.addEventListener("click", function(event) {
        console.log("episode: " + event.target.parentElement.id);
        console.log(episodes[event.target.parentElement.id].weights[0].weights);
        console.log(episodes[event.target.parentElement.id].weights[1].weights);
    });

    let header = document.createElement("th");
    header.scope = "row";
    header.innerHTML = info.episode;

    let damaged = document.createElement("td");
    damaged.innerHTML = info.damaged;
    if(info.damaged) damaged.style.fontWeight="bold";

    let distance = document.createElement("td");
    distance.innerHTML = info.distance;

    let speed = document.createElement("td");
    speed.innerHTML = info.speed;

    let reward = document.createElement("td");
    reward.innerHTML = info.reward;

    row.appendChild(header);
    row.appendChild(damaged);
    row.appendChild(distance);
    row.appendChild(speed);
    row.appendChild(reward);
    body.appendChild(row);
}

function reset(remember = false) {
    carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);

    env = new Environment(trafficCount, brainCount, carCanvas);
    const memory = model.brain.memory;
    model = new Car(-1, env.road.getLaneCenter(env.startLane), 100, env.driverSpeed + 1, "network", "red");
    model.addBrain("fsd", env);
    if(remember) model.brain.memory = memory;
}

function save() {
    localStorage.setItem("trainBrain", JSON.stringify(model.brain.save()));
}

function destroy() {
    localStorage.removeItem("trainBrain");
}

// prepare for training
function beginTrain() {
    document.body.style.overflow = "hidden";
    document.getElementById("trainTableBody").replaceChildren();
    numEpisodes = document.getElementById("episodeCountInput").value;
    maxTimeSteps = document.getElementById("timeLimitInput").value;
    let progress = document.getElementById("trainProgress");

    progress.style.width = "0%";
    progress.ariaValueNow = 0;
    progress.ariaValueMax = numEpisodes;

    episodeCounter = 0;

    reset();
    console.log("beginning training");
    episodeLoop();
}

function episodeLoop() {
    // load training brain
    if(localStorage.getItem("trainBrain")) {
        model.brain.updateLevels(JSON.parse(localStorage.getItem("trainBrain")));
    }

    // collect episode info
    info = train(model, env, parseInt(maxTimeSteps));
    info.episode = episodeCounter + 1;
    updateTrainStats();
    localStorage.setItem("trainBrain", JSON.stringify(info.weights));

    episodes.push(info);
    if(episodeCounter % 10 == 0) {
        reset(true);
    } else {
        reset();
    }
     episodeCounter++;

    if(episodeCounter < numEpisodes) animFrame = requestAnimationFrame(episodeLoop);
}

/*
    info card per car
        speed
        network info
            inputs applied
        clickable objects

        loss function fo networkedobjects
        lat and long spacing 

*/