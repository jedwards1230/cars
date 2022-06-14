import {
    lerp,
    MSE
} from "../utils.js";

export class Network {
    constructor(layers = [], lr = 0.001) {
        let epsDecayRate = document.getElementById("epsilonDecayInput").value;
        epsDecayRate = parseFloat(epsDecayRate);
        lr = parseFloat(document.getElementById("learningRateInput").value);

        this.memory = [];
        this.layers = [];
        this.epsilon = epsDecayRate;
        this.confidence = 0.5;

        this.lossFunction = (targets, outputs) => {
            let cost = 0
            for (let i = 0; i < outputs.length; i++) {
                cost += MSE(targets[i], outputs[i]);
            }
            return cost / outputs.length;
        };

        for (let i = 0; i < layers.length; i++) {
            layers[i].lr = lr;
            this.layers.push(layers[i]);
        }
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
