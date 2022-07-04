import { Controls } from "./controls";
import { Sensor } from "./sensor";
import { Network } from "../network/network";
import { polysIntersect } from "../utils";
import { AppConfig } from "../network/config";
import { Point } from "../utils";
import { TrainInfo } from "../network/train";

export class Car {
	readonly width: number;
	readonly height: number;
	readonly maxSpeed: number;
	readonly controller: string;
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
	damaged: boolean;
	useBrain: boolean;
	actionCount: number;
	polygon!: Point[];
	sensor!: Sensor;
	modelConfig!: AppConfig;
	brain!: Network;
	model!: string;
	sensorOffsets!: number[];

	constructor(
		id: number,
		x: number,
		y: number,
		maxspeed: number = 2,
		controller: string = "dummy",
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
		this.damaged = false;

		this.useBrain = false;

		this.controller = controller;
		this.controls = new Controls(controller);
		this.actionCount = 2;

		this.setColor();
		this.#createPolygon();
	}

	saveModelConfig(info?: TrainInfo) {
		if (info) this.modelConfig.generations.push(info);
		this.modelConfig.layers = this.brain.saveLayers();
		this.modelConfig.save();
	}

	loadBrainConfig(config: AppConfig) {
		this.modelConfig = config;
		this.model = config.alias;
		this.useBrain = true;
		this.actionCount = config.actionCount;
		this.brain = new Network(config);

		switch (this.model) {
			case "fsd":
				this.sensor = new Sensor(this, config.sensorCount, "forward");
				break;

			case "forward":
				this.sensor = new Sensor(this, config.sensorCount, "forward");
				break;

			default:
				console.log("Invalid brain");
		}
	}

	// update car object
	// if damaged, only process slow down and sensors
	update(borders: Point[][], traffic: Car[], action?: null | number[]) {
		if (action != null) this.updateControls(action);
		this.#move();

		if (this.distance < -100) this.damaged = true;

		if (!this.damaged) {
			this.#createPolygon();
			this.distance += this.speed;
			this.#checkDamage(borders, traffic);
		}
	}

	/** Update car controls */
	updateControls(input: number[]) {
		this.controls.forward = input[0] > 0.5 ? true : false;
		this.controls.backward = input[1] > 0.5 ? true : false;
		this.controls.left = input[2] > 0.5 ? true : false;
		this.controls.right = input[3] > 0.5 ? true : false;
	}

	getSensorData(borders: Point[][], traffic: Car[]) {
		let sensorOffsets: number[] = [(this.y / 250), this.angle, (this.speed / this.maxSpeed)];
		// update each sensor
		this.sensor.update(borders, traffic);
		const offsets = this.sensor.getSensorOffsets();
		sensorOffsets = sensorOffsets.concat(offsets);
		this.sensorOffsets = sensorOffsets;
		return sensorOffsets;
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

	lazyAction(borders: Point[][], traffic: Car[], backprop = false): null | number[] {
		if (!this.useBrain) return null;
		const sData = this.getSensorData(borders, traffic);
		const action = this.brain.forward(sData, backprop);
		return this.brain.makeChoice(action, true);
	}

	recordPlay(borders: Point[][], traffic: Car[]) {
		this.sensorOffsets = this.getSensorData(borders, traffic);
		const outputs = this.controls.getOutputs();
		this.brain.recordPlay(this.sensorOffsets, outputs);
	}

	#checkDamage(borders: Point[][], traffic: Car[]) {
		const damagedCars: Car[] = [];

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
			if (car.model === "fsd") car.speed = 0;
			car.controls.stop();
		});
	}

	#createPolygon() {
		const points: Point[] = [];
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

				if (
					(this.controls.left || this.controls.right) &&
					this.model === "fsd"
				) {
				}
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

	setColor() {
		switch (this.controller) {
			case "network":
				this.color = "rgba(200, 50, 50, 0.5)";
				break;
			case "player":
				this.color = "rgba(0, 255, 0, 1)";
				break;
			default:
				this.color = "rgba(0, 0, 255, 1)";
				break;
		}
		
	}

	draw(ctx: CanvasRenderingContext2D, bestCar = false) {
        if (this.damaged) {
            ctx.fillStyle = "rgba(145, 145, 145, 0.5)";
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
