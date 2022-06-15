export class Road {
    constructor(y, width, laneCount = 4) {
        this.y = y;
        this.width = width;
        this.laneCount = laneCount;

        this.top = y - width / 2;
        this.bottom = y + width / 2;

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

    getLaneCenter(laneIndex) {
        const laneWidth = this.width / this.laneCount;
        return this.top + laneWidth / 2 +
            Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }
}