import { Road } from "./road";
import { getRandomInt } from "../utils";
import { Car, DumbCar, SmartCar } from "./car";
import { AppConfig } from "../network/config";

export class Simulator {
    trafficCount: number;
    brainCount: number;
    smartTraffic: boolean;
    playable: boolean;
    activeBrains: number;
    trafficConfig: AppConfig;
    brainConfig: AppConfig;
    driverSpeed: number;
    laneCount: number;
    road: Road;
    startLane: number;
    traffic!: Car[];
    smartCars!: SmartCar[];
    loss: Loss;

    constructor(trafficCount: number, brainCount: number, smartConfig: AppConfig, smartTraffic = false, playable = false) {
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;
        this.activeBrains = brainCount;
        this.smartTraffic = smartTraffic;
        this.playable = playable;
        if (playable) this.brainCount = 1;

        this.loss = {
            loss: 0,
            count: 1,
        }

        this.trafficConfig = new AppConfig("trafficForward", "forward");
        this.brainConfig = smartConfig;

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

    getLoss(): number {
        return this.loss.loss / this.loss.count;
    }

    #updateSmartCars() {
        if (this.playable) {
            const car = this.smartCars[0];
            if (car.damaged) return
            const sData = car.getSensorData(this.road.borders, this.traffic);
            const output = car.brain.forward(sData, true);
            car.update(this.road.borders, this.traffic);
            const target = car.controls.getOutputs();

            // find average loss
            const loss = car.brain.lossFunction(target, output);
            this.loss.loss += loss
            this.loss.count++;

            if (loss < 0.1) {
                // derivative of loss function (how much gradient needs to be adjusted)
                const d = car.brain.deriveLoss(target, output);

                // backward pass to update weights
                car.brain.backward(d);
            }
        } else {
            this.smartCars.forEach(car => {
                const action = car.lazyAction(this.road.borders, this.traffic, true);
                car.update(this.road.borders, this.traffic, action);
            });
        }
    }

    #updateTraffic() {
        this.traffic.forEach((car) => {
            if (car instanceof SmartCar) {
                const action = car.lazyAction(this.road.borders, this.traffic)
                car.update(this.road.borders, this.traffic, action);
            } else {
                car.update(this.road.borders, this.traffic);
            }
        });
    }

    #generateBrains() {
        const smartCars: SmartCar[] = [];
        for (let i = 0; i < this.brainCount; i++) {
            const y = this.road.getLaneCenter(this.startLane);

            const car = new SmartCar(i, 0, y, this.driverSpeed + 1, this.brainConfig, this.playable);
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
                car = new SmartCar(i, x, y, this.driverSpeed + 1, this.trafficConfig);
            } else {
                car = new DumbCar(idx, x, y);
            }

            this.traffic.push(car);
        }
    }

    getBestCar(): SmartCar {
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
