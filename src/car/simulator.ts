import { Road } from "./road";
import { getRandomInt } from "../utils";
import { Car, DumbCar, SmartCar } from "./car";
import { AppConfig } from "../network/config";

export class Simulator {
    trafficCount: number;
    brainCount: number;
    smartTraffic: boolean;
    activeBrains: number;
    trafficConfig: AppConfig;
    brainConfig: AppConfig;
    driverSpeed: number;
    laneCount: number;
    road: Road;
    startLane: number;
    traffic: Car[];
    smartCars: SmartCar[];
    steps: number;
    x: number;

    constructor(trafficCount: number, brainCount: number, smartConfig: AppConfig, smartTraffic = false) {
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;
        this.activeBrains = brainCount;
        this.smartTraffic = smartTraffic;

        this.trafficConfig = new AppConfig("trafficForward", "forward");
        this.brainConfig = smartConfig;

        this.driverSpeed = 4;
        this.laneCount = 3;
        this.steps = 0;
        this.x = 0;

        this.road = new Road(this.laneCount);
        this.startLane = getRandomInt(0, this.road.laneCount - 1);
        this.traffic = this.generateTraffic();
        this.smartCars = this.generateSmartCars();
    }

    update() {
        this.steps++;
        this.updateTraffic();
        this.updateSmartCars();

        this.activeBrains = this.smartCars.filter(car => !car.damaged).length;
    }

    protected updateSmartCars() {
        const toDelete: number[] = [];
        for (let i = 0; i < this.smartCars.length; i++) {
            const car = this.smartCars[i];
            const action = car.lazyAction(this.road.borders, this.traffic, true);
            car.update(this.road.borders, this.traffic, action);
            if (car.damaged) toDelete.push(car.id);
            else if (car.x > this.x) this.x = car.x;
        }
        const bestCar = this.getBestCar();
        this.smartCars = this.smartCars.filter(car => !toDelete.includes(car.id) || car.id === bestCar.id);
    }

    protected updateTraffic() {
        for (let i = 0; i < this.traffic.length; i++) {
            const car = this.traffic[i];
            if (car instanceof SmartCar) {
                const action = car.lazyAction(this.road.borders, this.traffic)
                car.update(this.road.borders, this.traffic, action);
            } else {
                car.update(this.road.borders, this.traffic);
            }
        }
    }

    protected generateSmartCars() {
        const smartCars: SmartCar[] = [];
        const y = this.road.getLaneCenter(this.startLane);
        for (let i = 0; i < this.brainCount; i++) {
            const car = new SmartCar(i, 0, y, this.driverSpeed, this.brainConfig);
            if (i > 0) car.brain = smartCars[0].brain.mutate(this.brainConfig.mutationAmount, this.brainConfig.mutationRate);
            smartCars.push(car);
        }
        return smartCars;
    }

    protected generateTraffic() {
        const traffic = [];
        const placed = new Array(this.road.laneCount).fill(0);

        // randomize lane
        const getStartPosition = () => {
            const lane = getRandomInt(0, this.road.laneCount - 1);
            placed[lane] = placed[lane] + getRandomInt(200, 400);
            const x = placed[lane];
            const y = this.road.getLaneCenter(lane);
            return [x, y];
        };

        for (let i = 0; i < this.trafficCount; i++) {
            const idx = i + this.brainCount;
            const [x, y] = getStartPosition();

            const car = this.smartTraffic
                ? new SmartCar(i, x, y, this.driverSpeed, this.trafficConfig)
                : new DumbCar(idx, x, y);

            traffic.push(car);
        }
        return traffic
    }

    getBestCar(): SmartCar {
        let bestCar = this.smartCars[0];
        for (let i = 0; i < this.smartCars.length; i++) {
            const car = this.smartCars[i];
            if (car.fitness < bestCar.fitness) bestCar = car;
        }
        bestCar.countCarsPassed(this.traffic);
        return bestCar;
    }

    draw(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        const bestCar = this.getBestCar();
        ctx.save();

        // follow best car
        const canvasOffset = canvas.width * 0.3 - this.x;
        ctx.translate(canvasOffset, 0);

        // draw road
        this.road.draw(ctx);

        // draw smart cars
        for (let i = 0; i < this.smartCars.length; i++) {
            const car = this.smartCars[i];
            car.checkInBounds(canvasOffset);
            car.draw(ctx);
            ctx.globalAlpha = 1;
        }

        // draw traffic
        for (let i = 0; i < this.traffic.length; i++) {
            const car = this.traffic[i];
            car.draw(ctx);
            ctx.globalAlpha = 1;
        }

        if (!bestCar.damaged) bestCar.sensor.draw(ctx);
        bestCar.draw(ctx, true);

        ctx.restore();
    }

    reset() {
        this.steps = 0;
        this.startLane = getRandomInt(0, this.road.laneCount - 1);

        const name = this.brainConfig.name;
        const alias = this.brainConfig.alias;
        this.brainConfig = new AppConfig(name, alias);
        this.traffic = this.generateTraffic();
        this.smartCars = this.generateSmartCars();
    }
}

export class Teacher extends Simulator {
    loss: Loss;

    constructor(trafficCount: number, brainConfig: AppConfig, playable: boolean) {
        super(trafficCount, 1, brainConfig, playable);
        this.loss = {
            loss: 0,
            count: 1,
        }
    }

    protected updateSmartCars() {
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
    }

    protected generateSmartCars() {
        const y = this.road.getLaneCenter(this.startLane);
        return [new SmartCar(0, 0, y, this.driverSpeed, this.brainConfig, true)];;
    }

    reset() {
        super.reset();
        this.loss = {
            loss: 0,
            count: 1,
        }
    }

    getBestCar(): SmartCar {
        return this.smartCars[0];
    }

    getLoss(): number {
        return this.loss.loss / this.loss.count;
    }
}