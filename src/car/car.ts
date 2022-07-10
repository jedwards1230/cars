import { Controls } from "./controls";
import { Sensor } from "./sensor";
import { Network } from "../network/network";
import { polysIntersect } from "../utils";
import { AppConfig } from "../network/config";
import { DamagedOffScreenBounds, RoadCanvasDefaultHeight } from "../constants";

export class Car {
	readonly width: number;
	readonly height: number;
	readonly maxSpeed: number;
	readonly controls: Controls;
	readonly id: number;
	readonly acceleration: number;
	readonly friction: number;

	x: number;
	y: number;
	angle: number;
	speed: number;
	color!: string;

	distance: number;
	steps: number;
	damaged: boolean;
	actionCount: number;
	polygon!: Polygon;

	constructor(
		id: number,
		x: number,
		y: number,
		maxspeed: number = 2,
		controller: boolean = false,
	) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.width = 30;
		this.height = 50;

		this.angle = 0;

		this.speed = 1;
		this.maxSpeed = maxspeed;
		this.acceleration = 0.2;
		this.friction = 0.05;

		this.distance = 0;
		this.steps = 0;
		this.damaged = false;

		this.controls = new Controls(controller);
		this.actionCount = 2;

		this.#createPolygon();
	}

	// update car object
	update(borders: Point[][], traffic: Car[]) {
		this.#move();

		// if damaged, only process slow down and sensors
		if (!this.damaged) {
			this.#createPolygon();
			this.distance += this.speed;
			this.steps++;
			this.#checkDamage(borders, traffic);
		}
	}

	#checkDamage(borders: Point[][], traffic: Car[]) {
		const damagedCars: Car[] = [];

		// prevents turning around
		if (Math.abs(this.angle) > 1.7) {
			this.damaged = true;
			return;
		}

		// check collision with road borders
		borders.forEach((border) => {
			if (polysIntersect(this.polygon, border)) {
				damagedCars.push(this);
			}
		});

		// check collision with traffic
		traffic.forEach(car => {
			if (car !== this && polysIntersect(this.polygon, car.polygon)) {
				damagedCars.push(this);
				//damagedCars.push(car);
			}
		});

		// apply damage and stop controls
		damagedCars.forEach(car => {
			car.damaged = true;
			if (car instanceof SmartCar) car.speed = 0;
			car.controls.stop();
		});
	}

	#createPolygon() {
		const points: Polygon = [];
		const rad = Math.hypot(this.width, this.height) / 2;
		const alpha = Math.atan2(this.width, this.height);
		points.push({
			x: this.x - Math.cos(this.angle - alpha) * rad,
			y: this.y - Math.sin(this.angle - alpha) * rad,
		});
		points.push({
			x: this.x - Math.cos(this.angle + alpha) * rad,
			y: this.y - Math.sin(this.angle + alpha) * rad,
		});
		points.push({
			x: this.x - Math.cos(Math.PI + this.angle - alpha) * rad,
			y: this.y - Math.sin(Math.PI + this.angle - alpha) * rad,
		});
		points.push({
			x: this.x - Math.cos(Math.PI + this.angle + alpha) * rad,
			y: this.y - Math.sin(Math.PI + this.angle + alpha) * rad,
		});

		this.polygon = points;
	}

	#move() {
		if (!this.damaged) {
			// accelerate
			if (this.controls.forward) {
				this.speed += this.acceleration;
			} else if (this.controls.backward) {
				this.speed -= (this.acceleration * 3) / 2;
				if (this.speed < 0) this.speed = 0;
			}

			// check direction
			if (this.speed !== 0) {
				const flip = this.speed > 0 ? 1 : -1;

				if (this.controls.left) this.angle += 0.04 * flip;
				if (this.controls.right) this.angle -= 0.04 * flip;
			}

			// limit speed
			if (this.speed > this.maxSpeed) {
				this.speed = this.maxSpeed;
			} else if (this.speed < (-this.maxSpeed * 2) / 3) {
				this.speed = (-this.maxSpeed * 2) / 3;
			}
		}

		// add friction
		if (this.speed > 0) {
			this.speed -= this.friction;
		} else if (this.speed < 0) {
			this.speed += this.friction;
		}
		if (Math.abs(this.speed) < this.friction) this.speed = 0;

		this.speed = parseFloat(this.speed.toFixed(2));

		this.x += Math.cos(this.angle) * this.speed;
		this.y += Math.sin(this.angle) * this.speed;
	}

	draw(ctx: CanvasRenderingContext2D, bestCar = false) {
        if (this.damaged) {
            ctx.fillStyle = "rgba(145, 145, 145, 0.9)";
        } else if (bestCar) {
            ctx.fillStyle = "rgba(255, 0, 0, 1)";
        } else {
			ctx.fillStyle = this.color;
		}

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill();
    }
}

export class SmartCar extends Car {
	player: boolean;
	fitness: number;
	config: AppConfig;
	sensor: Sensor;
	brain: Network;
	sensorOffsets!: number[];

	constructor(id: number, x: number, y: number, maxSpeed: number, config: AppConfig, player = false) {
		super(id, x, y, maxSpeed, player);
		this.player = player;
		this.fitness = 0;
		this.color = player ? "rgba(0, 255, 0, 1)" : "rgba(200, 50, 50, 0.7)";
		
		this.config = config;
		this.actionCount = config.actionCount;
		this.brain = new Network(config);

		this.sensor = new Sensor(this, config.sensorCount, "forward");
	}

	update(borders: Point[][], traffic: Car[], action?: number[]) {
		const stepFactor = this.distance / this.steps;
		if (this.steps > 500 && stepFactor < 1) this.damaged = true;
		if (action) this.controls.update(action);
		super.update(borders, traffic);
		this.evaluate();
	}

	lazyAction(borders: Point[][], traffic: Car[], backprop = false): number[] {
		const sData = this.getSensorData(borders, traffic);
		const action = this.brain.forward(sData, backprop);
		return this.brain.makeChoice(action, true);
	}

	getSensorData(borders: Point[][], traffic: Car[]) {
		this.sensor.update(borders, traffic);

		const lanePosition = this.y / RoadCanvasDefaultHeight;
		const angle = this.angle;
		const speed = this.speed / this.maxSpeed;

		const offsets = this.sensor.getSensorOffsets();
		const sensorOffsets = [lanePosition, angle, speed].concat(offsets);

		this.sensorOffsets = sensorOffsets;
		return sensorOffsets;
	}

	/** Check fitness of car */
	evaluate() {
		const distance = this.distance;
		let fitness = 0;
		// higher step factor = faster, more focused car
		const stepFactor = distance / this.steps;

		fitness = stepFactor * distance;

		if (this.damaged) fitness -= distance / 5;
		if (this.controls.left && this.controls.right) fitness -= distance / 10;

		this.fitness = Math.abs(1 / fitness); 
	}

	getMetrics(action: number[]) {
		return {
			action: action,
			damaged: this.damaged,
			reward: this.getReward(),
		};
	}

	/** Get reward for current state */
	getReward() {
		const forward = 0;
		const backward = 1;
		const left = 2;
		const right = 3;

		const mOffset = Math.max(...this.sensorOffsets);
		const reward = new Array(this.actionCount).fill(0);

		if (this.damaged) {
			reward[forward] -= 1;
			reward[left] += 1;
			reward[right] += 1;
		}

		if (this.speed < 2 || this.distance < 0) {
			reward[forward] += 1;
			reward[left] -= 1;
			reward[right] -= 1;
		}
		if (this.actionCount > 2) {
			if (this.angle > 0.1) {
				reward[left] -= 0.5;
			} else if (this.angle < -0.1) {
				reward[right] -= 0.5;
			}
		}

		if (mOffset > 0) {
			reward[forward] -= mOffset;
			reward[left] += mOffset;
			reward[right] += mOffset;
			reward[backward] += mOffset;
		}

		return reward;
	}

	/** damage any car thats fallen too far behind */
	checkInBounds(ctx: CanvasRenderingContext2D) {
		this.polygon.forEach(point => {
			if (ctx.isPointInPath(point.x - DamagedOffScreenBounds, point.y)) {
				this.damaged = true;
			}
		})
	}

	draw(ctx: CanvasRenderingContext2D, bestCar?: boolean): void {
		if (!this.damaged || bestCar) super.draw(ctx, bestCar);
	}

	saveModelConfig(info?: TrainInfo) {
		if (info) this.config.generations.push(info);
		this.config.layers = this.brain.saveLayers();
		this.config.save();
	}
}

export class DumbCar extends Car {
	constructor(id: number, x: number, y: number) {
		super(id, x, y, 2);
		this.color = "rgba(0, 0, 255, 1)";
	}
}