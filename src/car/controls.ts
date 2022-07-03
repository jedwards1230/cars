export class Controls {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;

    constructor(controller: string) {
        this.forward = true;
        this.backward = false;
        this.left = false;
        this.right = false;

        if (controller === "player") {
            this.#addKeyboardListeners();
        } else {
            this.forward = true;
        }
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