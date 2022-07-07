import {
    getIntersection,
    lerp,
    Point
} from "../utils";
import { Car, DumbCar, SmartCar } from "./car";

type SensorReading = {
    x: number;
    y: number;
    offset: number;
};

export class Sensor {
    car: SmartCar;
    rayCount: number;
    rayLength: number;
    raySpread: number;
    direction: string;
    rays: Point[][];
    readings: SensorReading[];

    constructor(car: SmartCar, rays: number, direction: string) {
        this.car = car;
        this.rayCount = rays;
        this.rayLength = 200;
        this.raySpread = Math.PI / 2;

        this.direction = direction;

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders: Point[][], traffic: Car[]) {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic,
                )!,
            );
        };
    }

    getSensorOffsets() {
        return this.readings.map(
            s => s == null ? 0 : parseFloat((1 - s.offset).toFixed(4))
        );
    }

    #getReading(ray: Point[], roadBorders: Point[][], traffic: Car[]) : null | SensorReading {
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
            const car = traffic[i];
            const poly = car.polygon;
            if (this.car.id !== car.id && car instanceof DumbCar) {
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
        if (touches.length === 0) {
            return null;
        }

        const offsets = touches.map(e => e.offset);
        const minOffset = Math.min(...offsets);
        return touches.find(e => e.offset === minOffset)!;
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1),
            ) + this.car.angle;

            const start: Point = {
                x: this.car.x,
                y: this.car.y
            };
            const end: Point = {
                x: this.car.x,
                y: this.car.y
            }
            switch (this.direction) {
                case "left":
                    end.x = this.car.x - Math.sin(rayAngle) * this.rayLength
                    end.y = this.car.y - Math.cos(rayAngle) * this.rayLength
                    break;
                case "right":
                    end.x = this.car.x - Math.sin(rayAngle) * this.rayLength * -1
                    end.y = this.car.y - Math.cos(rayAngle) * this.rayLength * -1
                    break;
                case "backward":
                    end.x = this.car.x - Math.cos(rayAngle) * this.rayLength
                    end.y = this.car.y - Math.sin(rayAngle) * this.rayLength
                    break;
                case "forward":
                    end.x = this.car.x - Math.cos(rayAngle) * this.rayLength * -1
                    end.y = this.car.y - Math.sin(rayAngle) * this.rayLength * -1
                    break;
                default:
                    break;
            }

            this.rays.push([start, end]);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.rayCount; i++) {
            if (!this.rays[i]) continue;
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