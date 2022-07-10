import { RoadCanvasDefaultHeight } from "../constants";
import { lerp } from "../utils";

export class Road {
    y: number;
    width: number;
    laneCount: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
    borders: RoadBorder;

    constructor(laneCount = 4) {
        this.y = RoadCanvasDefaultHeight / 2;
        this.width = RoadCanvasDefaultHeight * 0.9;
        this.laneCount = laneCount;

        this.top = this.y - this.width / 2;
        this.bottom = this.y + this.width / 2;

        const infinity = 1000000;
        this.left = -infinity;
        this.right = infinity;

        const topLeft: Point = {
            x: this.left,
            y: this.top
        };
        const topRight: Point = {
            x: this.right,
            y: this.top
        };
        const bottomLeft: Point = {
            x: this.left,
            y: this.bottom
        };
        const bottomRight: Point = {
            x: this.right,
            y: this.bottom
        };
        this.borders = [
            [topLeft, topRight],
            [bottomLeft, bottomRight],
        ];
    }

    getLaneCenter(laneIndex: number) {
        const laneWidth = this.width / this.laneCount;
        return this.top + laneWidth / 2 +
            Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        for (let i = 1; i <= this.laneCount - 1; i++) {
            const y = lerp(
                this.top,
                this.bottom,
                i / this.laneCount,
            );

            ctx.setLineDash([20, 20]);

            ctx.beginPath();
            ctx.moveTo(this.left, y);
            ctx.lineTo(this.right, y);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        })
    }
}