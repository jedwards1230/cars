import { Road } from "./road";
import { getRandomInt } from "../utils";
import { Car } from "./car";
import { ModelConfig } from "../network/config";

export class Simulator {
    trafficCount: number;
    brainCount: number;
    smartTraffic: boolean;
    activeBrains: number;
    trafficConfig: ModelConfig;
    brainConfig: ModelConfig;
    driverSpeed: number;
    laneCount: number;
    road: Road;
    startLane: number;
    traffic!: Car[];
    smartCars!: Car[];

    constructor(trafficCount: number, brainCount: number, smartTraffic = false) {
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;
        this.activeBrains = brainCount;
        this.smartTraffic = smartTraffic;

        this.trafficConfig = new ModelConfig("trafficForward", "forward");
        this.trafficConfig.load();

        this.brainConfig = new ModelConfig("trainBrain", "fsd");
        this.brainConfig.load();

        this.driverSpeed = 3;
        this.laneCount = 3;

        this.road = new Road(this.laneCount);
        this.startLane = getRandomInt(0, this.road.laneCount - 1);
        this.#generateTraffic();
        this.#generateBrains();
    }

    update() {
        this.#updateTraffic();
        this.#updateSmartCars();

        this.activeBrains = this.smartCars.filter(car => !car.damaged).length;
    }

    #updateSmartCars() {
        this.smartCars.forEach(car => {
            const action = car.lazyAction(this.road.borders, this.traffic, true);
            car.update(this.road.borders, this.traffic, action);
        });
    }

    #updateTraffic() {
        this.traffic.forEach((car) => {
            const action = this.smartTraffic ? car.lazyAction(this.road.borders, this.traffic) : null;
            car.update(this.road.borders, this.traffic, action);
        });
    }

    #generateBrains() {
        const smartCars: Car[] = [];
        for (let i = 0; i < this.brainCount; i++) {
            const y = this.road.getLaneCenter(this.startLane);
            const car = new Car(i, 0, y, this.driverSpeed+1, "network");
            car.loadBrainConfig(this.brainConfig);
            if (i !== 0) car.brain.mutate(this.brainConfig.mutationRate);
            smartCars.push(car);
        }
        this.smartCars = smartCars;
    }

    #generateTraffic() {
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

        for (let i = 0; i < this.trafficCount; i++) {
            const idx = i + this.brainCount;
            const [x, y] = getStartPosition();

            let car;
            if (this.smartTraffic) {
                car = new Car(idx, x, y, getRandomInt(2, 3), "network");
                car.loadBrainConfig(this.trafficConfig);
            } else {
                car = new Car(idx, x, y, getRandomInt(2, 2), "dummy");
            }

            this.traffic.push(car);
        }
    }

    getBestCar(): Car {
        // find car that is undamaged and has greated x value
        const bestCar = this.smartCars.reduce((prev, curr) => {
            if (!curr.damaged && curr.x > prev.x) {
                return curr;
            }
            return prev;
        }, this.smartCars[0]);
        return bestCar;
    }

    draw(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        const bestCar = this.getBestCar();
        ctx.save();

        // follow best car
        ctx.translate(canvas.height * 0.7 - bestCar.x, 0);

        // draw road
        this.road.draw(ctx);

        // draw smart cars
        this.smartCars.forEach(car => {
            car.draw(ctx);
            ctx.globalAlpha = 1;
        });

        // draw traffic
        this.traffic.forEach(car => {
            car.draw(ctx);
            ctx.globalAlpha = 1;
        });

        if (!bestCar.damaged) bestCar.sensor.draw(ctx);
        bestCar.draw(ctx, true);

        ctx.restore();
    }
}
