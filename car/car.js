import {polysIntersect} from "../utils/utils.js";
import {Controls} from "./controls.js";
import {Sensor} from "./sensor.js";
import {Network} from "../network.js";
export class Car {
    constructor(id, x, y, maxspeed = 2, controller="dummy", color="blue", width=30, height=50) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

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

        this.polygon = this.#createPolygon();
        this.sensors = []
    }

    addBrain(model, env) {
        this.model = model;
        this.useBrain = true;
        switch(model) {
            case "fsd":
                this.sensors.push(new Sensor(this, 5, "forward"));
                this.brain = new Network(this, env)
                if(localStorage.getItem("trainBrain")) {
                    this.brain.updateLevels(JSON.parse(localStorage.getItem("trainBrain")));
                }
                break;

            case "forward":
                this.sensors.push(new Sensor(this, 5, "forward"));
                // todo: calc raycount for all sensors
                this.brain = new Network(this, env)
                if(localStorage.getItem("trainBrain")) {
                    this.brain.updateLevels(JSON.parse(localStorage.getItem("trainBrain")));
                }
                break;
        }
    }

    // update car object
    // if damaged, only process slow down and sensors
    update(roadBorders, traffic) {
        this.#move();

        if(!this.damaged) {
            this.polygon = this.#createPolygon();
            this.distance += this.speed;
            this.#checkDamage(roadBorders, traffic);
        }

        if(this.damaged) {
            console.log("crashed at ", this.distance);
        }
    }

    updateControls(a) {
        switch (a) {
            case 0:
                this.controls.forward = true;
                this.controls.backward = false;
            case 1:
                this.controls.backward = true;
                this.controls.forward = false;
        }
    }

    getSensorData(roadBorders, traffic) {
        let inputs = [Math.sin(this.speed), Math.sin(this.acceleration)];
        // update each sensor
        for(let i=0; i<this.sensors.length; i++) {
            this.sensors[i].update(roadBorders, traffic);
            const offsets = this.sensors[i].readings.map(
                s=>s==null ? 0 : 1 - s.offset
            );
            inputs = inputs.concat(offsets)
        }

        return inputs
    }

    #checkDamage(roadBorders, traffic) {
        let damage = null;
        for(let i=0; i < roadBorders.length; i++) {
            if(polysIntersect(this.polygon, roadBorders[i])) {
                damage = this.id;
            }
        }
        for(let i=0; i < traffic.length; i++) {
            if(traffic[i].id != this.id && traffic[i].model != "fsd") {
                if(polysIntersect(this.polygon, traffic[i].polygon)) {
                    damage = traffic[i].id;
                }
            }
        }

        if(damage == this.id) {
            this.damaged = true;
            this.speed = 0;
        } else if(traffic[damage]) {
            if(this.model != "fsd") {
                traffic[damage].damaged = true;
                traffic[damage].controls.forward = false;
            }
            this.damaged = true;
            this.speed = 0;
        }
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
        });
        
        return points;
    }

    #move() {
        if(!this.damaged) {
            // accelerate
            if(this.model == "fsd") {
                if(this.controls.forward) {
                    console.log("moving: accelerate");
                    this.speed += this.acceleration;
                } else if(this.controls.backward) {
                    console.log("moving: backward");
                    this.speed -= this.acceleration * 3 / 2;
                }
                console.log("moving: speed: ", this.speed);
            } else {
                if(this.controls.forward) {
                    this.speed += this.acceleration;
                } else if(this.controls.backward) {
                    this.speed -= this.acceleration * 3 / 2;
                }
            }

            // check direction
            if(this.speed != 0) {
                const flip=this.speed>0?1:-1;

                if(this.controls.left) {
                    this.angle += 0.04 * flip;
                }
                if(this.controls.right) {
                    this.angle -= 0.04 * flip;
                }
            } 

            // limit speed
            if(this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
            } else if(this.speed < -this.maxSpeed * 2 / 3) {
                this.speed = -this.maxSpeed * 2 / 3;
            }
        } else {
            console.log("damaged");
        }

        // add friction
        if(this.speed > 0) {
            this.speed -= this.friction;
        } else if(this.speed < 0) {
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }
        
        this.speed = parseFloat(this.speed.toFixed(2));

        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;
    }

    draw(ctx, drawSensors) {
        if(this.damaged) {
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = this.color;
            if(this.sensors[0] && drawSensors) {
                this.sensors[0].draw(ctx);
            }
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill();
    }
}