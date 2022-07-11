export class Controls {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;

    constructor(playable: boolean) {
        this.forward = !playable;
        this.backward = false;
        this.left = false;
        this.right = false;

        if (playable) {
            this.#addKeyboardListeners();
        }
    }

	/** Update car controls */
    update(input: number[], threshold: number) {
        const [forward, backward, left, right] = input;

        this.forward = (forward > threshold && forward > backward) ? true : false;
        this.backward = (backward > threshold && backward > forward) ? true : false;
        this.left = (left > threshold && left > right) ? true : false;
        this.right = (right > threshold && right > left) ? true : false;
    }

    moveforward() {
        this.forward = true;
        this.backward = false;
    }

    movebackward() {
        this.forward = false;
        this.backward = true;
    }

    moveleft() {
        this.left = true;
        this.right = false;
    }

    moveright() {
        this.left = false;
        this.right = true;
    }

    getOutputs(): number[] {
        const outputStates = [this.forward, this.backward, this.left, this.right];
        return outputStates.map((state) => state ? 1 : 0);
    }

    stop() {
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
    }

    #addKeyboardListeners() {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowUp":
                    this.right = true;
                    break;
                case "ArrowDown":
                    this.left = true;
                    break;
                case "ArrowLeft":
                    this.backward = true;
                    break;
                case "ArrowRight":
                    this.forward = true;
                    break;
                default:
                    break;
            }
        }
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowUp":
                    this.right = false;
                    break;
                case "ArrowDown":
                    this.left = false;
                    break;
                case "ArrowLeft":
                    this.backward = false;
                    break;
                case "ArrowRight":
                    this.forward = false;
                    break;
                default:
                    break;
            }
        }
    }
}