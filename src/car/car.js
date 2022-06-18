import { Controls } from "./controls.js";
import { Sensor } from "./sensor.js";
import { Network } from "../network/network.js";
import { polysIntersect } from "../utils.js";

export class Car {
    /** 
     * @param {number} id - The id of the car.
     * @param {number} x - The x coordinate of the car.
     * @param {number} y - The y coordinate of the car.
     * @param {number} maxSpeed - The maximum speed of the car.
     * @param {string} controller - dummy, network, or player
     * @param {string} color - The color of the car.
     * @param {number} width - The width of the car.
     * @param {number} height - The height of the car.
     */
    constructor(id, x, y, maxspeed = 2, controller = "dummy", color = "blue") {
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
        this.sensors = []
    }

    reset(x, y) {
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
        return this.modelConfig;
    }

    loadBrainConfig(config) {
        this.modelConfig = config;
        this.model = config.alias;
        this.useBrain = true;
        this.brain = new Network(config);
        let sensorCount = 3;
        
        switch (this.model) {
            case "fsd":
                //sensorCount = 5;
                this.sensors = new Sensor(this, sensorCount, "forward");
                break;

            case "forward":
                this.sensors = new Sensor(this, sensorCount, "forward");
                break;

            default:
                console.log("Invalid brain");
        }
    }

    // update car object
    // if damaged, only process slow down and sensors
    update(traffic, borders, action = null) {
        if (action != null) this.updateControls(action);
        this.#move();

        if (this.distance < -1000) this.damaged = true;

        if (!this.damaged) {
            this.polygon = this.#createPolygon();
            const prev_distance = this.distance;
            this.distance += this.speed;
            this.onTrack = (this.distance > prev_distance) ? 1 : 0;
            traffic = this.#checkDamage(borders, traffic);
        }

        return traffic;
    }

    /**
     * Update car controls
     * @param {number} a 0: forward, 1: backward, 2: left, 3: right
     */
    updateControls(a) {
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
                this.controls.left = true;
                this.controls.right = false;
                break;
            case 3:
                // right
                this.controls.left = false;
                this.controls.right = true;
                break;
            default:
                break;
        }
    }


    getSensorData(roadBorders, traffic) {
        let sensorOffsets = [];
        // update each sensor
        this.sensors.update(roadBorders, traffic);
        const offsets = this.sensors.getSensorOffsets();
        sensorOffsets = sensorOffsets.concat(offsets)
        return sensorOffsets
    }

    /** Get observation of environment */
    getObservation(borders, traffic) {
        if (!traffic) return;
        this.sensorOffsets = this.getSensorData(borders, traffic)
        const observation = [this.speed].concat(this.sensorOffsets);
        return observation
    }

    getMetrics(action) {
        return {
            action: action,
            damaged: this.damaged,
            reward: this.getReward(action),
        }
    }

    /** Get reward for current state */
    getReward(action) {
        const reward = new Array(this.actionCount).fill(0);

        if (this.damaged) reward[action] -= 1;
        if (this.speed < 1 || this.distance < 0) {
            reward[0] += 1;
            reward[1] -= 1;
        }
        if (this.actionCount > 2) {
            if (this.angle > 1) {
                reward[3] -= 0.5;
            }
            else if (this.angle < -1) {
                reward[2] -= 0.5;
            }
        }

        const mOffset = Math.max(...this.sensorOffsets);
        if (mOffset > 0) {
            reward[0] -= mOffset;
            reward[1] += mOffset;
        }

        return reward;
    }

    lazyAction(borders, traffic, backprop = false) {
        if (!this.useBrain) return null;
        // eslint-disable-next-line no-unused-vars
        const sData = this.getSensorData(borders, traffic);
        const action = this.brain.forward(sData, backprop);
        return this.brain.makeChoice(action);
    }

    #checkDamage(roadBorders, traffic) {
        let damage = null;
        // check collision with road borders
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                damage = this.id;
            }
        }
        // check collision with traffic
        for (let i = 0; i < traffic.length; i++) {
            const car = traffic[i];
            if (car.id !== this.id && car.model !== "fsd") {
                if (polysIntersect(this.polygon, car.polygon)) {
                    damage = car.id;
                }
            }
        }

        // set values if car or any traffic are damaged
        if (damage === this.id) {
            this.damaged = true;
            this.speed = 0;
        } else if (traffic[damage]) {
            if (this.model !== "fsd") {
                traffic[damage].damaged = true;
                traffic[damage].controls.forward = false;
            }
            this.damaged = true;
            this.speed = 0;
        }

        //if (this.distance < -10) this.damaged = true;
        return traffic;
    }

    #createPolygon() {
        const points = [];
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
                this.speed -= this.acceleration * 3 / 2;
            }

            // check direction
            if (this.speed !== 0) {
                const flip = this.speed > 0 ? 1 : -1;

                if (this.controls.left) this.angle += 0.04 * flip;
                if (this.controls.right) this.angle -= 0.04 * flip;

                if ((this.controls.left || this.controls.right) &&
                    this.model === "fsd") {
                }
            }

            // limit speed
            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
            } else if (this.speed < -this.maxSpeed * 2 / 3) {
                this.speed = -this.maxSpeed * 2 / 3;
            }
        } else {
            console.log("damaged");
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

    draw(ctx, drawSensors = false) {
        if (this.damaged) {
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = this.color;
            if (this.sensors && drawSensors) {
                this.sensors.draw(ctx);
            }
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill();
    }
}