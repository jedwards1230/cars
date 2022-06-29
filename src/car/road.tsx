type Point = {
    x: number;
    y: number;
};

export class Road {
    y: number;
    width: number;
    laneCount: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
    borders: Point[][];

    constructor(laneCount = 4) {
        const defaultY = 250;
        this.y = defaultY / 2;
        this.width = defaultY * 0.9;
        this.laneCount = laneCount;

        this.top = this.y - this.width / 2;
        this.bottom = this.y + this.width / 2;

        const infinity = 1000000;
        this.left = -infinity;
        this.right = infinity;

        const topLeft = {
            x: this.left,
            y: this.top
        };
        const topRight = {
            x: this.right,
            y: this.top
        };
        const bottomLeft = {
            x: this.left,
            y: this.bottom
        };
        const bottomRight = {
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
}