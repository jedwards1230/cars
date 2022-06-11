import {
    Road
} from "../utils/road.js";
import {
    getRandomInt,
    load
} from "../utils/utils.js";
import {
    Car
} from "../car/car.js";

export class Environment {
    constructor(trafficCount, brainCount, carCanvas) {
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;

        this.driverSpeed = 3;
        this.laneCount = 4;

        this.done = false;

        this.road = new Road(carCanvas.height / 2, carCanvas.height * 0.9, this.laneCount);
        this.startLane = getRandomInt(0, this.road.laneCount - 1);

        this.reset();
    }

    reset(smart = false) {
        this.traffic = this.generateTraffic(this.trafficCount, smart);
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
        const carCanvas = document.getElementById("carCanvas");
        const networkCanvas = document.getElementById("networkCanvas");
        const navbarHeight = document.getElementById("nav").offsetHeight;

        // update dimensions
        carCanvas.style.top = navbarHeight + "px";
        carCanvas.width = window.innerWidth;
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

    generateTraffic(N, smart = false) {
        const cars = [];
        const placed = new Array(this.road.laneCount).fill(100);

        for (let i = 0; i < N; i++) {
            // randomize lane
            const lane = getRandomInt(0, this.road.laneCount - 1);
            const nextLane = placed[lane - 1] ? lane - 1 : lane + 1;
            placed[lane] = placed[lane] + getRandomInt(150, 250);
            const idx = i + this.brainCount;
            const x = placed[lane];
            const y = this.road.getLaneCenter(lane);

            let car;
            if (smart) {
                car = new Car(idx, x, y, 3, "network");
                car.addBrain("forward", this);
                const modelData = load("trainBrain");
                if (modelData) {
                    car.brain.loadBrain(modelData.brain);
                }
            } else {
                car = new Car(idx, x, y, getRandomInt(2, 2), "dummy");
            }

            cars.push(car);
        }
        return cars
    }
}