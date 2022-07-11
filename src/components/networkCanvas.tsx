import React, { useRef, useEffect, useContext, useState } from "react";
import { Layer } from "../network/layers"
import { Network } from "../network/network"
import {
    getRGBA,
    lerp
} from "../utils";
import { AppContext } from "../context";
import { NetworkCanvasDefaultHeight } from "../constants";

const NetworkCanvas = (props: {
    network: Network;
}) => {
    const drawNetwork = (network: Network) => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;
        const margin = 50;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelWidth = width / network.layers.length;

        const last = network.layers.length - 1;
        const actionValues = network.layers[last].outputs;
        const [forward, backward, left, right] = actionValues;
        actionValues[0] = (forward > 0.5 && forward > backward) ? 1 : 0;
        actionValues[1] = (backward > 0.5 && backward > forward) ? 1 : 0;
        actionValues[2] = (left > 0.5 && left > right) ? 1 : 0;
        actionValues[3] = (right > 0.5 && right > left) ? 1 : 0;
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
        ctx.scale(-1, 1);
    }

    const drawLevel = (level: Layer, top: number, left: number, width: number, height: number, outputLabels: string[]) => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;
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
                    getNodeY(inputs, i, bottom, top)
                );
                ctx.lineTo(
                    right,
                    getNodeY(outputs, j, bottom, top)
                );
                ctx.lineWidth = 2;
                ctx.strokeStyle = getRGBA(inputs[i] * weights[i][j]);
                ctx.stroke();
            }
        }

        // draw input nodes
        const nodeRadius = 18;
        for (let i = 0; i < inputs.length; i++) {
            const y = getNodeY(inputs, i, bottom, top);
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
            const y = getNodeY(outputs, i, bottom, top);
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

    const getNodeY = (nodes: number[], index: number, bottom: any, top: any) => {
        return lerp(
            bottom,
            top,
            nodes.length === 1 ?
            0.5 :
            index / (nodes.length - 1)
        );
    }
    
    const appContext = useContext(AppContext);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animTime = appContext.animTime!;

    const [brain, setBrain] = useState<Network>(props.network);
    
    useEffect(() => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;

        canvas.width = window.innerWidth;
        ctx.lineDashOffset = -animTime / 40;

        drawNetwork(brain)
    })

    useEffect(() => {
        setBrain(props.network);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.network]);

    return <canvas ref={canvasRef} id="networkCanvas" width={window.innerWidth} height={NetworkCanvasDefaultHeight} />
}

export default NetworkCanvas;