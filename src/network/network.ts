import { MSE } from "../utils";
import { AppConfig } from "./config";
import {
    LayerMap,
    Layer,
} from "./layers";

export class Network {
    name: string;
    epsilon: number;
    lr: number;
    alias: string;
    memory: any[];
    layers: Layer[];
    confidence: number;
    lossFunction: (targets: number[], outputs: number[]) => number;
    deriveLoss: (targets: number[], outputs: number[]) => number[];

    constructor(modelConfig: AppConfig) {
        this.memory = [];
        this.layers = [];
        this.confidence = 0.5;
        this.name = modelConfig.name;
        this.lr = modelConfig.lr;
        this.epsilon = modelConfig.epsilonDecay;
        this.alias = modelConfig.alias;
        this.setModelLayers(modelConfig.layers);

        this.lossFunction = (targets, outputs) => {
            let cost = 0
            for (let i = 0; i < outputs.length; i++) {
                cost += MSE(targets[i], outputs[i]);
            }
            return cost / outputs.length;
        };

        this.deriveLoss = (targets, outputs) => {
            const derivatives = [];
            for (let i = 0; i < outputs.length; i++) {
                derivatives[i] = (targets[i] - outputs[i]) * 2;
            }
            return derivatives;
        }
    }

    /** Forward pass each layer */
    forward(inputs: number[], backprop = false): number[] {
        let outputs = this.layers[0].forward(inputs, backprop);
        for (let i = 1; i < this.layers.length; i++) {
            outputs = this.layers[i].forward(outputs, backprop);
        }
        return outputs;
    }

    /** Backward pass each layer */
    backward(delta: number[]) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            delta = this.layers[i].backward(delta);
        }
    }

    /** Choose action based on confidence or with epsilon greedy */
    makeChoice(outputValues: number[], greedy = false) {
        // choose random
        const random = Math.random();
        if (greedy && (random < this.epsilon)) {
            outputValues.forEach(value => {
                value = Math.floor(Math.random() * outputValues.length);
            })
        } 
        this.decay();
        return outputValues;
    }

    saveLayers() {
        const layers: LayerConfig[] = [];
        this.layers.forEach((level, index) => {
            level.id = index;
            layers.push(level.save());
        });

        return layers
    }

    /** Set model layers */
    setModelLayers = (layers: LayerConfig[]) => {
        const preparedLayers = new Array(layers.length);
        layers.forEach((layerConfig, i) => {
            layerConfig.lr = this.lr;
            preparedLayers[i] = new LayerMap[layerConfig.activation](layerConfig);
        })
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

    /** Slightly mutate weights for model */
    mutate(amount: number = 0.1, rate: number = 0) {
        this.layers.forEach((layer) => {
            layer.mutate(amount, rate);
        })
    }
}
