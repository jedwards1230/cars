import {
    lerp,
    MSE
} from "../utils.js";
import { ModelConfig } from "./config.js";
import {
    Linear,
    Sigmoid,
    Relu,
    LeakyRelu,
    Tanh,
    SoftMax,
    Layer,
} from "./layers";

export class Network {
    name!: string;
    epsilon!: number;
    lr!: number;
    alias!: string;
    memory: any[];
    layers: Layer[];
    confidence: number;
    lossFunction: (targets: number[], outputs: number[]) => number;

    constructor(modelConfig: ModelConfig) {
        this.memory = [];
        this.layers = [];
        this.confidence = 0.5;
        this.loadBrain(modelConfig);

        this.lossFunction = (targets, outputs) => {
            let cost = 0
            for (let i = 0; i < outputs.length; i++) {
                cost += MSE(targets[i], outputs[i]);
            }
            return cost / outputs.length;
        };
    }

    /** Forward pass each layer */
    forward(inputs: number[], backprop = false) {
        let outputs = this.layers[0].forward(inputs, backprop);
        for (let i = 1; i < this.layers.length; i++) {
            outputs = this.layers[i].forward(outputs, backprop);
        }
        return outputs;
    }

    /** Backward pass each layer */
    backward(delta: any[]) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            delta = this.layers[i].backward(delta);
        }
    }

    /** Choose action based on confidence or with epsilon greedy */
    makeChoice(outputValues: number[], greedy = false) {
        // choose random
        const random = Math.random();
        let choice;
        if (greedy && (random < this.epsilon)) {
            choice = Math.floor(Math.random() * outputValues.length);
        } else {
            const m = Math.max(...outputValues);
            choice = outputValues.indexOf(m);
        }
        this.decay();
        return choice;
    }

    saveLayers() {
        const layers: any[] = [];
        this.layers.forEach((level, index) => {
            level.id = index;
            layers.push(level.save());
        });

        return layers
    }

    loadBrain(config: ModelConfig) {
        this.name = config.name;
        this.lr = config.lr;
        this.epsilon = config.epsilonDecay;
        this.alias = config.alias;
        this.setModelLayers(config.layers);
    }

    /** Set model layers */
    setModelLayers = (layers: string | any[]) => {
        let preparedLayers = new Array(layers.length);
        for (let i = 0; i < layers.length; i++) {
            switch (layers[i].activation) {
                case "Linear":
                    preparedLayers[i] = new Linear(layers[i]);
                    break;
                case "Sigmoid":
                    preparedLayers[i] = new Sigmoid(layers[i]);
                    break;
                case "Relu":
                    preparedLayers[i] = new Relu(layers[i]);
                    break;
                case "LeakyRelu":
                    preparedLayers[i] = new LeakyRelu(layers[i]);
                    break;
                case "Tanh":
                    preparedLayers[i] = new Tanh(layers[i]);
                    break;
                case "SoftMax":
                    preparedLayers[i] = new SoftMax(layers[i]);
                    break;
                default:
                    console.log("Unknown activation function");
                    break;
            }
        }
        this.layers = preparedLayers;
    }

    decay() {
        // epsilon decay
        if (this.epsilon > 0.01) this.epsilon *= 0.99;

        // learning rate decay
        for (let i = this.layers.length - 1; i >= 0; i--) {
            this.layers[i].lr = this.layers[i].lr > 0.0001 ? this.layers[i].lr * 0.99 : 0.0001;
        }
    }

    /** Slightly mutate weights for model
     * @param {number} amount - 0-1, how much to mutate
     */
    mutate(amount = 1) {
        this.layers.forEach(level => {
            for (let i = 0; i < level.inputs.length; i++) {
                for (let j = 0; j < level.outputs.length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount,
                    )
                }
            }
            for (let i=0; i < level.outputs.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                )
            }
        });
    }
}
