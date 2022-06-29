import { Road } from "./road";
import { getRandomInt } from "../utils.js";
import { Car } from "./car";
import { ModelConfig } from "../network/config";

export class Environment {
    trafficCount: number;
    brainCount: number;
    smart: boolean;
    traffic: Car[];
    modelConfig: ModelConfig;
    driverSpeed: number;
    laneCount: number;
    road: Road;
    startLane: number;

    constructor(trafficCount: number, brainCount: number, smart = false) {
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;
        this.smart = smart;
        this.traffic = [];

        this.modelConfig = new ModelConfig("trafficForward", "forward");
        this.modelConfig.load();

        this.driverSpeed = 3;
        this.laneCount = 3;

        this.road = new Road(this.laneCount);
        this.startLane = getRandomInt(0, this.road.laneCount - 1);
        this.generateTraffic();
    }

    update() {
        for (let i = 0; i < this.traffic.length; i++) {
            if (this.traffic[i].model !== "fsd") {
                const car = this.traffic[i];
                const action = car.lazyAction(this.road.borders, this.traffic);
                car.update(this.traffic, this.road.borders, action);
            }
        }
    }

    generateTraffic() {
        const N = this.trafficCount;
        this.traffic = [];
        let placed = new Array(this.road.laneCount).fill(100);

        // randomize lane
        const getStartPosition = () => {
            const lane = getRandomInt(0, this.road.laneCount - 1);
            placed[lane] = placed[lane] + getRandomInt(200, 350);
            const x = placed[lane];
            const y = this.road.getLaneCenter(lane);
            return [x, y];
        };

        let car;
        for (let i = 0; i < N; i++) {
            const idx = i + this.brainCount;
            const [x, y] = getStartPosition();

            if (this.smart) {
                car = new Car(idx, x, y, getRandomInt(2, 3), "network");
                car.loadBrainConfig(this.modelConfig);
            } else {
                car = new Car(idx, x, y, getRandomInt(2, 2), "dummy");
            }

            this.traffic.push(car);
        }
    }
}
