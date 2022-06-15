import React, { useEffect, useRef } from "react";
import {
    getRGBA,
    lerp
} from "../utils.js";


const VisualizerComponent = props => {

    const canvasRef = useRef(null);

    const drawNetwork = (network) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const margin = 50;
        const width = context.canvas.width - margin * 2;
        const height = context.canvas.height - margin * 2;

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

            context.setLineDash([7, 3]);
            drawLevel(network.layers[i],
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
        context.scale(-1, 1);
    }

    const drawLevel = (level, top, left, width, height, outputLabels) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const right = left + width;
        const bottom = top + height;

        const inputs = level.inputs;
        const outputs = level.outputs;
        const weights = level.weights;
        const biases = level.biases;

        // drawn lines for weights * biases
        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                context.beginPath();
                context.moveTo(
                    left,
                    getNodeY(inputs, i, bottom, top)
                );
                context.lineTo(
                    right,
                    getNodeY(outputs, j, bottom, top)
                );
                context.lineWidth = 2;
                context.strokeStyle = getRGBA(inputs[i] * weights[i][j]);
                context.stroke();
            }
        }

        // draw input nodes
        const nodeRadius = 18;
        for (let i = 0; i < inputs.length; i++) {
            const y = getNodeY(inputs, i, bottom, top);
            context.beginPath();
            context.arc(left, y, nodeRadius, 0, Math.PI * 2);
            context.fillStyle = "black";
            context.fill();
            context.beginPath();
            context.arc(left, y, nodeRadius * 0.6, 0, Math.PI * 2);
            context.fillStyle = getRGBA(inputs[i]);
            context.fill();
        }

        // draw output nodes
        for (let i = 0; i < outputs.length; i++) {
            const y = getNodeY(outputs, i, bottom, top);
            context.beginPath();
            context.arc(right, y, nodeRadius, 0, Math.PI * 2);
            context.fillStyle = "black";
            context.fill();
            context.beginPath();
            context.arc(right, y, nodeRadius * 0.6, 0, Math.PI * 2);
            context.fillStyle = getRGBA(outputs[i]);
            context.fill();

            context.beginPath();
            context.lineWidth = 2;
            context.arc(right, y, nodeRadius * 0.8, 0, Math.PI * 2);
            context.strokeStyle = getRGBA(biases[i]);
            context.setLineDash([3, 3]);
            context.stroke();
            context.setLineDash([]);

            if (outputLabels[i] && outputs[i] === 1) {
                context.beginPath();
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillStyle = "black";
                context.strokeStyle = "white";
                context.font = (nodeRadius * 1.5) + "px Arial";
                context.fillText(outputLabels[i], right, y + nodeRadius * 0.1);
                context.lineWidth = 0.5;
                context.strokeText(outputLabels[i], right, y + nodeRadius * 0.1);
            }
        }
    }

    const getNodeY = (nodes, index, bottom, top) => {
        return lerp(
            bottom,
            top,
            nodes.length === 1 ?
            0.5 :
            index / (nodes.length - 1)
        );
    }

    useEffect(() => {
        drawNetwork(props.brain, 0);
    }, []);

    return <canvas ref={canvasRef} id={props.id} width={window.innerWidth} height={props.height} />
}

export default VisualizerComponent;