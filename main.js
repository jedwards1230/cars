import {Environment} from "./utils/environment.js";
import {Visualizer} from "./utils/visualizer.js";
import {Car} from "./car/car.js";
import {train} from "./train.js";

const canvases = document.getElementById("canvases");
const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");

carCanvas.width = 300;
networkCanvas.width = 450;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const trafficCount = 100;
const brainCount = 1;
let numEpisodes = 1;
let maxTimeSteps = 21;

let env
let model

let anim = true;
let animFrame;

handleButtons();

function main() {
    if(anim) {
        reset();
        animate();
    }
}

function animate(time) {
    // update cars
    env.update();
    model.update(env.road.borders, env.traffic);

    let observation = model.getSensorData(env.road.borders, env.traffic);
    const action = model.brain.forward(observation);
    model.updateControls(action);

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
    setTimeout( function() {
        document.getElementById("trainTableBody").replaceChildren();
        document.body.style.overflow = "hidden";
        document.getElementById("welcome").style.display = "none";
        document.getElementById("play").style.display = "flex";
        document.getElementById("train").style.display = "none";
        document.getElementById("nav").style.display = "flex";
        document.getElementById("toggleView").innerHTML = "Train";
    } , 100);
}

function setTrainView() {
    setTimeout( function() {
        document.body.style.overflow = "visible";
        document.getElementById("welcome").style.display = "none";
        document.getElementById("play").style.display = "none";
        document.getElementById("train").style.display = "flex";
        document.getElementById("nav").style.display = "flex";
        document.getElementById("toggleView").innerHTML = "Play";

        document.getElementById("episodeCountInput").value = numEpisodes;
        document.getElementById("timeLimitInput").value = maxTimeSteps;
    } , 100);
}

function toggleView() {
    cancelAnimationFrame(animFrame);
    if(anim) {
        setPlayView();
    } else {
        setTrainView();
    }
    main();
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
        main();
    });
    document.querySelector("#startPlay").addEventListener("click", function() {
        anim = true;
        setPlayView();
        main();
    });
    document.querySelector("#toggleView").addEventListener("click", function() {
        anim = !anim;
        toggleView();
    });
}

function updateTrainStats(info) {
    document.getElementById("trainStats").style.display = "table";
    let body = document.getElementById("trainTableBody");
    let row = document.createElement("tr");
    let header = document.createElement("th");
    header.scope = "row";
    header.innerHTML = info.episode;
    let damaged = document.createElement("td");
    damaged.innerHTML = info.damaged;
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

function reset() {
    carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);

    env = new Environment(trafficCount, brainCount, carCanvas);
    model = new Car(-1, env.road.getLaneCenter(env.startLane), 100, env.driverSpeed + 1, "network", "red");
    model.addBrain("fsd", env);
}

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(model.brain.save()));
}

function destroy() {
    localStorage.removeItem("bestBrain");
}

function beginTrain() {
    document.getElementById("trainTableBody").replaceChildren();
    numEpisodes = document.getElementById("episodeCountInput").value;
    maxTimeSteps = document.getElementById("timeLimitInput").value;

    let info;
    reset();

    for(let i=0; i<numEpisodes; i++) {
        if(localStorage.getItem("trainBrain")) {
            model.brain.updateLevels(JSON.parse(localStorage.getItem("trainBrain")));
        }
        info = train(model, env, maxTimeSteps);
        info.episode = i + 1;
        updateTrainStats(info);

        env.reset();
    }

    main();
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