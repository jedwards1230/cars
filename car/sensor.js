import {
    getIntersection,
    lerp
} from "../utils.js";

export class Sensor {
    constructor(car, rays, direction) {
        this.car = car;
        this.rayCount = rays;
        this.rayLength = 175;
        this.raySpread = Math.PI / 4;

        this.direction = direction;

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, traffic) {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic,
                ),
            );
        };
    }

    getSensorOffsets() {
        return this.readings.map(
            s => s == null ? 0 : parseFloat((1 - s.offset).toFixed(4))
        );
    }

    #getReading(ray, roadBorders, traffic) {
        let touches = [];

        // check overlap with borders
        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1],
            );
            if (touch) {
                touches.push(touch);
            }
        };

        // check overlap with other traffic
        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon;
            if (this.car.id != traffic[i].id && traffic[i].model != "fsd") {
                for (let j = 0; j < poly.length; j++) {
                    const value = getIntersection(
                        ray[0],
                        ray[1],
                        poly[j],
                        poly[(j + 1) % poly.length],
                    );
                    if (value) {
                        touches.push(value);
                    }
                }
            }
        }

        // no touches
        if (touches.length == 0) {
            return null;
        }

        const offsets = touches.map(e => e.offset);
        const minOffset = Math.min(...offsets);
        return touches.find(e => e.offset == minOffset);
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1),
            ) + this.car.angle;

            const start = {
                x: this.car.x,
                y: this.car.y
            };
            let end = {}
            switch (this.direction) {
                case "left":
                    end = {
                        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
                    }
                    break;
                case "right":
                    end = {
                        x: this.car.x - Math.sin(rayAngle) * this.rayLength * -1,
                        y: this.car.y - Math.cos(rayAngle) * this.rayLength * -1,
                    }
                    break;
                case "backward":
                    end = {
                        x: this.car.x - Math.cos(rayAngle) * this.rayLength,
                        y: this.car.y - Math.sin(rayAngle) * this.rayLength,
                    }
                    break;
                case "forward":
                    end = {
                        x: this.car.x - Math.cos(rayAngle) * this.rayLength * -1,
                        y: this.car.y - Math.sin(rayAngle) * this.rayLength * -1,
                    }
                    break;
            }

            this.rays.push([start, end]);
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1];
            if (this.readings[i]) {
                end = this.readings[i];
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'teal';
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y,
            );
            ctx.lineTo(
                end.x,
                end.y,
            )
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y,
            );
            ctx.lineTo(
                end.x,
                end.y,
            )
            ctx.stroke();
        }
    }
}