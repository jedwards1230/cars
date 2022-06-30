import { Controls } from "./controls";
import { Sensor } from "./sensor";
import { Network } from "../network/network";
import { polysIntersect } from "../utils";
import { ModelConfig } from "../network/config";

type Point = {
	x: number;
	y: number;
};

export class Car {
	id: number;
	x: number;
	y: number;
	readonly width: number;
	readonly height: number;
	readonly color: string;
	angle: number;
	speed: number;
	readonly maxSpeed: number;
	acceleration: number;
	friction: number;
	onTrack: number;
	distance: number;
	damaged: boolean;
	useBrain: boolean;
	readonly controller: string;
	readonly controls: Controls;
	actionCount: number;
	polygon: Point[];
	sensors!: Sensor;
	modelConfig!: ModelConfig;
	brain!: Network;
	model!: string;
	sensorOffsets!: number[];

	constructor(
		id: number,
		x: number,
		y: number,
		maxspeed: number = 2,
		controller: string = "dummy",
		color: string = "blue"
	) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.width = 30;
		this.height = 50;
		this.color = color;

		this.angle = 0;

		this.speed = 1;
		this.maxSpeed = maxspeed;
		this.acceleration = 0.2;
		this.friction = 0.05;
		this.onTrack = 1;

		this.distance = 0;
		this.damaged = false;

		this.useBrain = false;

		this.controller = controller;
		this.controls = new Controls(controller);
		this.actionCount = 2;

		this.polygon = this.#createPolygon();
	}

	reset(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.speed = 0;
		this.distance = 0;
		this.damaged = false;
		this.angle = 0;
		this.polygon = this.#createPolygon();
	}

	saveModelConfig() {
		this.modelConfig.layers = this.brain.saveLayers();
		this.modelConfig.save();
	}

	loadBrainConfig(config: ModelConfig) {
		this.modelConfig = config;
		this.model = config.alias;
		this.useBrain = true;
		this.actionCount = config.actionCount;
		this.brain = new Network(config);

		switch (this.model) {
			case "fsd":
				this.sensors = new Sensor(this, config.sensorCount, "forward");
				break;

			case "forward":
				this.sensors = new Sensor(this, config.sensorCount, "forward");
				break;

			default:
				console.log("Invalid brain");
		}
	}

	// update car object
	// if damaged, only process slow down and sensors
	update(traffic: any[], borders: any[], action?: number) {
		if (action != null) this.updateControls(action);
		this.#move();

		if (this.distance < -100) this.damaged = true;

		if (!this.damaged) {
			this.polygon = this.#createPolygon();
			const prev_distance = this.distance;
			this.distance += this.speed;
			this.onTrack = this.distance > prev_distance ? 1 : 0;
			this.#checkDamage(borders, traffic);
		}
	}

	/**
	 * Update car controls
	 * @param {number} a 0: forward, 1: backward, 2: left, 3: right
	 */
	updateControls(a: number) {
		switch (a) {
			case 0:
				// forward
				this.controls.forward = true;
				this.controls.backward = false;
				this.controls.left = false;
				this.controls.right = false;
				break;
			case 1:
				// backward
				this.controls.forward = false;
				this.controls.backward = true;
				this.controls.left = false;
				this.controls.right = false;
				break;
			case 2:
				// left
				this.controls.forward = false;
				this.controls.backward = false;
				this.controls.left = true;
				this.controls.right = false;
				break;
			case 3:
				// right
				this.controls.forward = false;
				this.controls.backward = false;
				this.controls.left = false;
				this.controls.right = true;
				break;
			default:
				break;
		}
	}

	getSensorData(roadBorders: any, traffic: any) {
		let sensorOffsets: number[] = [];
		// update each sensor
		this.sensors.update(roadBorders, traffic);
		const offsets = this.sensors.getSensorOffsets();
		sensorOffsets = sensorOffsets.concat(offsets);
		return sensorOffsets;
	}

	getMetrics(action: number) {
		return {
			action: action,
			damaged: this.damaged,
			reward: this.getReward(action),
		};
	}

	/** Get reward for current state */
	getReward(action: number) {
		const forward = 0;
		const backward = 1;
		const left = 2;
		const right = 3;

		const mOffset = Math.max(...this.sensorOffsets);
		const reward = new Array(this.actionCount).fill(0);

		//reward[forward] = 1;

		if (this.damaged) {
			reward[forward] -= 1;
			reward[left] += 1;
			reward[right] += 1;
		}

		if (this.speed < 2 || this.distance < 0) {
			reward[forward] += 1;
			reward[left] -= 1;
			reward[right] -= 1;
			//reward[backward] -= 1;
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

	lazyAction(borders: any, traffic: any, backprop = false): number {
		if (!this.useBrain) return -1;
		const sData = this.getSensorData(borders, traffic);
		this.sensorOffsets = sData;
		const action = this.brain.forward(sData, backprop);
		return this.brain.makeChoice(action);
	}

	#checkDamage(roadBorders: any, traffic: any) {
		const damaged: Car[] = [];
		// check collision with road borders
		for (let i = 0; i < roadBorders.length; i++) {
			if (polysIntersect(this.polygon, roadBorders[i])) {
				damaged.push(this);
			}
		}
		// check collision with traffic
		for (let i = 0; i < traffic.length; i++) {
			const car = traffic[i];
			if (car.id !== this.id) {
				if (polysIntersect(this.polygon, car.polygon)) {
					damaged.push(this);
					damaged.push(car);
				}
			}
		}

		damaged.forEach(
			(car: {
				damaged: boolean;
				model: string;
				speed: number;
				controls: { forward: boolean };
			}) => {
				car.damaged = true;
				car.damaged = true;
				if (car.model === "fsd") car.speed = 0;
				car.controls.forward = false;
			}
		);
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

		return points;
	}

	#move() {
		if (!this.damaged) {
			// accelerate
			if (this.controls.forward) {
				this.speed += this.acceleration;
			} else if (this.controls.backward) {
				this.speed -= (this.acceleration * 3) / 2;
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
}
