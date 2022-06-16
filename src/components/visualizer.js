import {
    getRGBA,
    lerp
} from "../utils.js";

export class Visualizer {
    constructor() {
        this.canvas = document.getElementById("networkCanvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.height = 450;
        this.active = false;
    }

    draw(brain, time) {
        this.canvas.width = window.innerWidth;
        this.context.lineDashOffset = -time / 40;
        this.drawNetwork(brain)
    }

    drawNetwork(network) {
        const ctx = this.context;
        const margin = 50;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelWidth = width / network.layers.length;

        const last = network.layers.length - 1;
        let actionValues = network.layers[last].outputs;
        const idx = actionValues.indexOf(Math.max(...actionValues));
        for (let j = 0; j < actionValues.length; j++) {
            if (j === idx) {
                actionValues[j] = 1;
            } else {
                actionValues[j] = 0;
            }
        }
        network.layers[last].outputs = actionValues;

        for (let i = network.layers.length - 1; i >= 0; i--) {
            const levelEnd = margin +
                lerp(
                    0,
                    width - levelWidth,
                    network.layers.length === 1 ?
                    0.5 :
                    i / (network.layers.length - 1)
                );

            ctx.setLineDash([7, 3]);
            this.drawLevel(network.layers[i],
                margin, levelEnd,
                levelWidth, height,
                i === network.layers.length - 1
                // up, down, left, right
                ?
                //['\u290a', '\u290b', '\u21da', '\u21db'] :
                ['\u21db', '\u21da', '\u290b', '\u290a'] :
                []
            );
        }
        ctx.scale(-1, 1);
    }

    drawLevel(level, top, left, width, height, outputLabels) {
        const ctx = this.context;
        const right = left + width;
        const bottom = top + height;

        const inputs = level.inputs;
        const outputs = level.outputs;
        const weights = level.weights;
        const biases = level.biases;

        // drawn lines for weights * biases
        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(
                    left,
                    this.#getNodeY(inputs, i, bottom, top)
                );
                ctx.lineTo(
                    right,
                    this.#getNodeY(outputs, j, bottom, top)
                );
                ctx.lineWidth = 2;
                ctx.strokeStyle = getRGBA(inputs[i] * weights[i][j]);
                ctx.stroke();
            }
        }

        // draw input nodes
        const nodeRadius = 18;
        for (let i = 0; i < inputs.length; i++) {
            const y = this.#getNodeY(inputs, i, bottom, top);
            ctx.beginPath();
            ctx.arc(left, y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(left, y, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(inputs[i]);
            ctx.fill();
        }

        // draw output nodes
        for (let i = 0; i < outputs.length; i++) {
            const y = this.#getNodeY(outputs, i, bottom, top);
            ctx.beginPath();
            ctx.arc(right, y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(right, y, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(outputs[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(right, y, nodeRadius * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = getRGBA(biases[i]);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if (outputLabels[i] && outputs[i] === 1) {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "black";
                ctx.strokeStyle = "white";
                ctx.font = (nodeRadius * 1.5) + "px Arial";
                ctx.fillText(outputLabels[i], right, y + nodeRadius * 0.1);
                ctx.lineWidth = 0.5;
                ctx.strokeText(outputLabels[i], right, y + nodeRadius * 0.1);
            }
        }
    }

    #getNodeY(nodes, index, bottom, top) {
        return lerp(
            bottom,
            top,
            nodes.length === 1 ?
            0.5 :
            index / (nodes.length - 1)
        );
    }
}