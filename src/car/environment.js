import { Road } from "./road.js";
import { getRandomInt } from "../utils.js";
import { Car } from "./car.js";
import { ModelConfig } from "../network/config.js";

export class Environment {
    constructor(trafficCount, brainCount, carCanvas, smart = false) {
        this.canvas = carCanvas;
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;
        this.smart = smart;

        this.modelConfig = new ModelConfig("trafficForward", "forward");
        this.modelConfig.load();

        this.driverSpeed = 3;
        this.laneCount = 3;

        this.road = new Road(
            this.canvas.height / 2,
            this.canvas.height * 0.9,
            this.laneCount
        );
        this.startLane = getRandomInt(0, this.road.laneCount - 1);
        this.generateTraffic();
    }

    render() {
        const navbarHeight = document.getElementById("nav").offsetHeight;

        // update dimensions
        this.canvas.style.top = navbarHeight + "px";
        this.canvas.width = window.innerWidth;
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
            //const nextLane = placed[lane - 1] ? lane - 1 : lane + 1;
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
                car = new Car(idx, x, y, getRandomInt(2, 3), "network");
                car.loadBrainConfig(this.modelConfig);
            } else {
                car = new Car(idx, x, y, getRandomInt(2, 2), "dummy");
            }

            this.traffic.push(car);
        }
    }
}
