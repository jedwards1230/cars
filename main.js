const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 300;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 450;

const laneCount = 3
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, laneCount);

const trafficCount = 100;
const brainCount = 300;

var startLane = 2;
var driverSpeed = 3;
var mutateDegree = 0.25;

import {getRandomInt} from "./utils.js";
import {Car} from "./car.js";
import {Road} from "./road.js";
import {Visualizer} from "./visualizer.js";
import {Network} from "./network.js";

let traffic = generateCars(brainCount).concat(generateTraffic(trafficCount));
let bestCar = traffic[0];

animate();

function reset() {
    traffic = generateCars(brainCount).concat(generateTraffic(trafficCount));
}

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function destroy() {
    localStorage.removeItem("bestBrain");
}

function end() {
    let dmgCt = 0;
    let goodCt = 0;
    let goodW = [];
    let badW = [];
    for(let i=0; i<traffic.length; i++) {
        if(traffic[i].model == 'fsd') {
            if(traffic[i].damaged) {
                dmgCt += 1;
                console.log(traffic[i].brain.levels)
            } else {
                goodCt += 1;
            }
        } 
    }
    console.log("good", goodCt, ", bad", dmgCt);
}

function deleteBest() {
    const id = bestCar.id;
    const car = traffic.find(
        c=>c.id == id
    );
    const index = traffic.indexOf(car);
    if (index > -1) {
        traffic.splice(index, 1); // 2nd parameter means remove one item only
      }
}

function generateCars(N) {
    const cars = [];
    for(let i=0; i<N; i++) {
        cars.push(new Car(i, road.getLaneCenter(startLane), 100, driverSpeed, "network", "fsd", "red"));
        if(i!=0) {
            Network.mutate(cars[i].brain, mutateDegree);
        }
    }
    return cars
}

function generateTraffic(N) {
    const cars = [];
    const placed = [];
    for(let i=0; i<road.laneCount; i++) {
        placed.push(100);
    }

    for(let i=0; i<N; i++) {
        // randomize lane
        const lane = getRandomInt(0,road.laneCount-1);
        
        const nextLane = placed[lane - 1] ? lane - 1 : lane + 1;
        placed[lane] = placed[lane] - getRandomInt(150, 250);
        //cars.push(new Car(i+brainCount, road.getLaneCenter(lane), placed[lane], getRandomInt(2,2), "dummy"));
        cars.push(new Car(i+brainCount, road.getLaneCenter(lane), placed[lane], getRandomInt(2,4), "network", "forward"));
1    }
    return cars
}

// Search for best car
function getBestCar() {
    const te = traffic.filter(
        c=>c.model=="fsd" && !c.damaged
    )
    bestCar = te.find(
        c=>c.y==Math.min(
            ...te.map(c=>c.y)
        )
    )
}

function drawCars() {
    carCtx.save();
    carCtx.translate(0, carCanvas.height * 0.7 - bestCar.y);
    road.draw(carCtx);
    for(let i=0; i<traffic.length; i++) {
        if(traffic[i].model == "fsd") {
            carCtx.globalAlpha = 0.2;
        }
        traffic[i].draw(carCtx);
        carCtx.globalAlpha = 1;
    }
    bestCar.draw(carCtx, true);
    carCtx.restore();
}

function drawVisualizer(time) {
    networkCtx.lineDashOffset = -time / 40;
    Visualizer.drawNetwork(networkCtx, bestCar.brain)
}

function animate(time) {
    // update cars
    for(let i=0; i<traffic.length; i++) {
        traffic[i].update(road.borders, traffic);
    }

    getBestCar();    

    // update dimensions
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    drawCars();
    drawVisualizer(time);

    requestAnimationFrame(animate);
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