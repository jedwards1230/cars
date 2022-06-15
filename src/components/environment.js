import { Road } from "./road.js";
import { getRandomInt } from "../utils.js";
import {
    Linear,
    Sigmoid,
    Relu,
    LeakyRelu,
    Tanh,
    SoftMax,
} from "../network/layers.js";
import { Car } from "../car/car.js";

export class Environment {
    constructor(trafficCount, brainCount, roadConfig, smart = false) {
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;
        this.smart = smart;

        const trafficInputs = 4;
        const trafficOutputs = 2;

        this.modelLayers = [
            new Tanh(trafficInputs, 3),
            new Sigmoid(3, trafficOutputs),
        ];

        this.driverSpeed = 3;
        this.laneCount = 3;

        this.road = new Road(
            roadConfig.y,
            roadConfig.width,
            this.laneCount
        );
        this.startLane = getRandomInt(0, this.road.laneCount - 1);
        this.generateTraffic();
    }

    end() {
        let dmgCt = 0;
        let goodCt = 0;
        let goodW = [];
        let badW = [];
        for (let i = 0; i < this.traffic.length; i++) {
            if (this.traffic[i].model === "fsd") {
                if (this.traffic[i].damaged) {
                    dmgCt += 1;
                    console.log(this.traffic[i].brain.layers);
                } else {
                    goodCt += 1;
                }
            }
        }
        console.log("good", goodCt, ", bad", dmgCt);
    }

    update() {
        for (let i = 0; i < this.traffic.length; i++) {
            if (this.traffic[i].model !== "fsd") {
                const car = this.traffic[i];
                let action = car.lazyAction(this.road.borders, this.traffic);
                this.traffic = car.update(this.traffic, this.road.borders, action);
            }
        }
    }

    generateTraffic() {
        const N = this.trafficCount;
        this.traffic = [];
        let placed = new Array(this.road.laneCount).fill(100);

        // randomize lane
        const getStartPosition = (i) => {
            const lane = getRandomInt(0, this.road.laneCount - 1);
            const nextLane = placed[lane - 1] ? lane - 1 : lane + 1;
            placed[lane] = placed[lane] + getRandomInt(200, 350);
            const x = placed[lane];
            const y = this.road.getLaneCenter(lane);
            return [x, y];
        };

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
