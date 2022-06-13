import {
    Road
} from "./road.js";
import {
    getRandomInt,
    load
} from "../utils.js";
import {
    Linear,
    Sigmoid,
    Relu,
    LeakyRelu,
    Tanh,
    SoftMax
} from "../network/layers.js";
import {
    Car
} from "../car/car.js";

export class Environment {
    constructor(trafficCount, brainCount, carCanvas, smart=false) {
        this.canvas = carCanvas;
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;
        this.smart = smart;

        const trafficInputs = 2;
        const trafficOutputs = 2;

        this.modelLayers = [
            new Relu(trafficInputs, 5),
            new Sigmoid(5, trafficOutputs),
        ];

        this.driverSpeed = 3;
        this.laneCount = 4;

        this.road = new Road(this.canvas.height / 2, this.canvas.height * 0.9, this.laneCount);
        this.startLane = getRandomInt(0, this.road.laneCount - 1);
        this.generateTraffic();
    }

    end() {
        let dmgCt = 0;
        let goodCt = 0;
        let goodW = [];
        let badW = [];
        for (let i = 0; i < this.traffic.length; i++) {
            if (this.traffic[i].model == 'fsd') {
                if (this.traffic[i].damaged) {
                    dmgCt += 1;
                    console.log(this.traffic[i].brain.layers)
                } else {
                    goodCt += 1;
                }
            }
        }
        console.log("good", goodCt, ", bad", dmgCt);
    }

    render() {
        const networkCanvas = document.getElementById("networkCanvas");
        const navbarHeight = document.getElementById("nav").offsetHeight;

        // update dimensions
        this.canvas.style.top = navbarHeight + "px";
        this.canvas.width = window.innerWidth;
        networkCanvas.width = window.innerWidth;
    }

    update() {
        for (let i = 0; i < this.traffic.length; i++) {
            if (this.traffic[i].model != "fsd") {
                const car = this.traffic[i];
                let action = null;
                if (car.sensors.length > 0) {
                    const [observation, metrics] = car.getObservation(this.road.borders, this.traffic);
                    action = car.brain.makeChoice(observation);
                }
                this.traffic = car.update(this.traffic, this.road.borders, action);
            }
        }
    }

    generateTraffic() {
        const N = this.trafficCount;
        this.traffic = [];
        let placed = new Array(this.road.laneCount).fill(200);

        // randomize lane
        const getStartPosition = (i) => {
            const lane = getRandomInt(0, this.road.laneCount - 1);
            const nextLane = placed[lane - 1] ? lane - 1 : lane + 1;
            placed[lane] = placed[lane] + getRandomInt(200, 350);
            const x = placed[lane];
            const y = this.road.getLaneCenter(lane);
            return [x, y]
        }

        let car;
        for (let i = 0; i < N; i++) {
            const idx = i + this.brainCount;
            const [x, y] = getStartPosition(i);

            if (this.smart) {
                car = new Car(idx, x, y, getRandomInt(2, 4), "network");
                car.addBrain("forward", this, this.modelLayers);
            } else {
                car = new Car(idx, x, y, getRandomInt(2, 2), "dummy");
            }

            this.traffic.push(car);
        }
    }
}