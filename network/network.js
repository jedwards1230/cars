import {
    lerp,
    getRandomInt,
    MSE
} from "../utils/utils.js";
import {
    Linear,
    Sigmoid,
    Relu,
    LeakyRelu,
    Tanh,
    SoftMax
} from "./layers.js";

export class Network {
    constructor(inputCount, outputCount, lr = 0.01, hiddenLayers = []) {
        this.memory = [];
        this.epsilon = 0.3;
        this.confidence = 0.5;

        this.lossFunction = MSE;

        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);

        this.layers = [
            new LeakyRelu(inputCount, 2, lr),
            new Sigmoid(2, outputCount, lr),
        ];
    }

    /** Forward pass each layer */
    forward(inputs, backprop = true) {
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
    makeChoice(outputValues, randomChance = false) {
        // choose random
        const random = Math.random();
        if (randomChance && random < this.epsilon) {
            return Math.floor(Math.random() * outputValues.length);
        }
        // choose highest score
        const m = Math.max(...outputValues);
        return outputValues.indexOf(m);
    }

    /** Load weights to each layer */
    loadBrain(saved) {
        const weights = saved.weights;
        const biases = saved.biases;
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].loadWeights(weights[i]);
            this.layers[i].loadBiases(biases[i]);
        }
    }

    /** Get weights and biases from each layer */
    save() {
        const weights = [];
        const biases = [];
        for (let i = 0; i < this.layers.length; i++) {
            weights.push(this.layers[i].weights);
            biases.push(this.layers[i].biases);
        }
        return {
            weights: weights,
            biases: biases
        };
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
