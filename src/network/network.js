import {
    lerp,
    MSE
} from "../utils.js";
import {
    Linear,
    Sigmoid,
    Relu,
    LeakyRelu,
    Tanh,
    SoftMax,
} from "./layers.js";

export class Network {
    constructor(modelConfig) {
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
    forward(inputs, backprop = false) {
        let outputs = this.layers[0].forward(inputs, backprop);
        for (let i = 1; i < this.layers.length; i++) {
            outputs = this.layers[i].forward(outputs, backprop);
        }
        return outputs;
    }

    /** Backward pass each layer */
    backward(delta) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            delta = this.layers[i].backward(delta);
        }
    }

    /** Choose action based on confidence or with epsilon greedy */
    makeChoice(outputValues, greedy = false) {
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
        const layers = [];
        this.layers.forEach((level, index) => {
            level.id = index;
            layers.push(level.save());
        });

        return layers
    }

    loadBrain(saved) {
        this.name = saved.name;
        this.lr = saved.lr;
        this.epsilon = saved.epsilonDecay;
        this.alias = saved.alias;
        this.setModelLayers(saved.layers);
    }

    /**
     * Set model layers
     * @param {array} layers - array of layer configs
     */
    setModelLayers = layers => {
        let preparedLayers = new Array(layers.length);
        for (let i = 0; i < layers.length; i++) {
            switch (layers[i].activation) {
                case "Linear":
                    preparedLayers[i] = new Linear(layers[i], this.lr);
                    break;
                case "Sigmoid":
                    preparedLayers[i] = new Sigmoid(layers[i], this.lr);
                    break;
                case "Relu":
                    preparedLayers[i] = new Relu(layers[i], this.lr);
                    break;
                case "LeakyRelu":
                    preparedLayers[i] = new LeakyRelu(layers[i], this.lr);
                    break;
                case "Tanh":
                    preparedLayers[i] = new Tanh(layers[i], this.lr);
                    break;
                case "SoftMax":
                    preparedLayers[i] = new SoftMax(layers[i], this.lr);
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
        });
    }
}

export const defaultTrainBrain = {
    "name": "trainBrain",
    "alias": "fsd",
    "lr": 0.001,
    "layers": [
        {
            "activation": "Tanh",
            "id": 0,
            "inputs": 3,
            "outputs": 3,
        }, {
            "activation": "Sigmoid",
            "id": 1,
            "inputs": 3,
            "outputs": 2,
        }
    ],
    "generations": []
}