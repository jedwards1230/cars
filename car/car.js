import {
    polysIntersect
} from "../utils/utils.js";
import {
    Controls
} from "./controls.js";
import {
    Sensor
} from "./sensor.js";
import {
    Network
} from "../network/network.js";
export class Car {
    constructor(id, x, y, maxspeed = 2, controller = "dummy", color = "blue", width = 30, height = 50) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.angle = 0;

        this.speed = 0;
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

    addBrain(model, env, activeModel = "trainBrain") {
        this.model = model;
        this.useBrain = true;
        let observation, metrics;

        switch (model) {
            case "fsd":
                this.sensors.push(new Sensor(this, 5, "forward"));
                [observation, metrics] = this.getObservation(env.road.borders, env.traffic);

                this.brain = new Network(observation.length, this.actionCount)
                if (localStorage.getItem(activeModel)) {
                    this.brain.loadWeights(JSON.parse(localStorage.getItem(activeModel)));
                }
                break;

            case "forward":
                this.sensors.push(new Sensor(this, 5, "forward"));
                [observation, metrics] = this.getObservation(env.road.borders, env.traffic);

                // todo: calc raycount for all sensors
                this.brain = new Network(observation.length, this.actionCount)
                if (localStorage.getItem(activeModel)) {
                    this.brain.loadWeights(JSON.parse(localStorage.getItem(activeModel)));
                }
                break;
        }
    }

    // update car object
    // if damaged, only process slow down and sensors
    update(traffic, borders, action = null) {
        if (action != null) this.updateControls(action);
        this.#move();

        if (!this.damaged) {
            this.polygon = this.#createPolygon();
            const prev_distance = this.distance;
            this.distance += this.speed;
            this.onTrack = (this.distance > prev_distance) ? 1 : 0;
            traffic = this.#checkDamage(borders, traffic);
        }

        return traffic;
    }

    updateControls(a) {
        switch (a) {
            /* case 0:
                console.log("release")
                this.controls.forward = false;
                this.controls.backward = false;
                break; */
            case 0:
                //console.log("forward")
                this.controls.forward = true;
                this.controls.backward = false;
                break;
            case 1:
                //console.log("backward")
                this.controls.forward = false;
                this.controls.backward = true;
                break;
        }
    }

    getSensorData(roadBorders, traffic) {
        let sensorOffsets = [];
        // update each sensor
        for (let i = 0; i < this.sensors.length; i++) {
            this.sensors[i].update(roadBorders, traffic);
            const offsets = this.sensors[i].getSensorOffsets();
            sensorOffsets = sensorOffsets.concat(offsets)
        }
        return sensorOffsets
    }

    getObservation(borders, traffic) {
        const sensorOffsets = this.getSensorData(borders, traffic)
        const observation = [this.speed / this.maxSpeed].concat(sensorOffsets);
        const reward = this.getReward(sensorOffsets);
        const metrics = {
            damaged: this.damaged,
            reward: reward,
        }
        return [observation, metrics]
    }

    getReward(sensorOffsets) {
        const mOffset = Math.max(...sensorOffsets);

        if (this.damaged) return -3;
        if (this.onTrack == 0) {
            if (this.speed < 1) return -2;
            return -1;
        }
        //if(mOffset > 0.5) return (-mOffset * 2) - 1;

        let reward = (1 - mOffset) * 2;
        //if(this.speed > 0) reward += 0.5;
        return reward;
    }

    #checkDamage(roadBorders, traffic) {
        let damage = null;
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                damage = this.id;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            const car = traffic[i];
            if (car.id != this.id && car.model != "fsd") {
                if (polysIntersect(this.polygon, car.polygon)) {
                    damage = car.id;
                }
            }
        }

        if (damage == this.id) {
            this.damaged = true;
            this.speed = 0;
        } else if (traffic[damage]) {
            if (this.model != "fsd") {
                traffic[damage].damaged = true;
                traffic[damage].controls.forward = false;
            }
            this.damaged = true;
            this.speed = 0;
        }
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
            if (this.speed != 0) {
                const flip = this.speed > 0 ? 1 : -1;

                if (this.controls.left) this.angle += 0.04 * flip;
                if (this.controls.right) this.angle -= 0.04 * flip;
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
                this.sensors[0].draw(ctx);
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