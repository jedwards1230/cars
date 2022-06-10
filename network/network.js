import {
    lerp,
    getRandomInt
} from "../utils/utils.js";

export class Network {
    constructor(inputCount, outputCount, lr = 0.01, hiddenLayers = []) {
        this.layers = [];
        this.memory = [];
        this.epsilon = 0.3;
        this.confidence = 0.5;

        this.lossFunction = MSE;

        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);

        // generate levels
        // todo: make this more flexible
        let neurons = [inputCount, outputCount];
        for (let i = 0; i < neurons.length - 1; i++) {
            // if first
            if (i == 0) {
                this.layers.push(new Level(neurons[i], neurons[i + 1], lr, new LeakyRelu()));
            // if middle
            } else if (i < neurons.length - 2) {
                this.layers.push(new Level(neurons[i], neurons[i + 1], lr, new Relu()));
            // if last
            } else {
                this.layers.push(new Level(neurons[i], neurons[i + 1], lr, new Sigmoid()));
            }
        }
    }

    forward(inputs, backprop = true) {
        let outputs = this.layers[0].forward(inputs, backprop);
        for (let i = 1; i < this.layers.length; i++) {
            outputs = this.layers[i].forward(outputs, backprop);
        }
        return outputs;
    }

    backward(delta) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            delta = this.layers[i].backward(delta);
        }
    }

    experienceReplay(batchSize = 30, damaged = false) {
        if (this.memory.length <= batchSize) return null;

        let idx = getRandomInt(1, this.memory.length - batchSize - 1);
        if (damaged) {
            idx = this.memory.length - batchSize - 1;
        }

        let avgLoss = 0;

        for (let i = idx; i < batchSize; i++) {
            const gamma = 0.99;
            const [metrics, action, new_observation, prev_observation] = this.memory[i];

            const actualValues = this.forward(prev_observation);
            const nextActualValues = this.forward(new_observation, false);
            const nextAction = metrics.damaged ? 0 : Math.max(...nextActualValues);
            //const delta = this.getDeltaGradient(metrics.reward, actualValues, action, nextAction);
            const d = JSON.parse(JSON.stringify(actualValues));
            d[action] -= -metrics.reward + (gamma * nextAction) - actualValues[action]

            avgLoss += this.lossFunction(actualValues, d);

            let alpha = new Array(actualValues.length).fill(0);
            for (let i = 0; i < actualValues.length; i++) {
                alpha[i] = d[i] - actualValues[i];
            }

            this.backward(alpha);

            // epsilon decay
            if (this.epsilon > 0.01) this.epsilon *= 0.99;

            // learning rate decay
            for (let i = this.layers.length - 1; i >= 0; i--) {
                this.layers[i].lr = this.layers[i].lr > 0.0001 ? this.layers[i].lr * 0.99 : 0.0001;
            }
        }
        return avgLoss / batchSize;
    }

    getDeltaGradient(reward, actionValues, action, next) {
        const gamma = 0.99;
        let gradient = new Array(actionValues.length).fill(0);
        for (let i = 0; i < actionValues.length; i++) {
            const expected = reward + (gamma * next) - actionValues[action];
            gradient[i] = expected / actionValues.length;
        }
        gradient[action] *= -1;
        return gradient;
    }

    // epsilon greedy policy, the network will be more likely to explore early on
    selectAction(observation, randomChance = false) {
        const actionValues = this.forward(observation, false);
        const random = Math.random();
        if (randomChance && random < this.epsilon) {
            // choose random
            return Math.floor(Math.random() * actionValues.length);
        }
        // choose highest score
        const m = Math.max(...actionValues);
        return actionValues.indexOf(m);
    }

    remember(metrics, action, observation, prev_observation) {
        this.memory.push([metrics, action, observation, prev_observation]);
    }

    loadWeights(weights) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].loadWeights(weights[i]);
        }
    }

    save() {
        let weights = [];
        for (let i = 0; i < this.layers.length; i++) {
            weights.push(this.layers[i].weights);
        }
        return weights;
    }

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

class Level {
    constructor(inputs, outputs, lr, activation = null) {
        this.activation = activation;
        this.lr = lr;

        this.backwardStoreIn = new Array(inputs);
        this.inputs = new Array(inputs);
        this.weights = new Array(inputs);
        for (let i = 0; i < inputs; i++) {
            this.weights[i] = new Array(outputs).fill(0);
        }

        this.backwardStoreOut = new Array(outputs);
        this.outputs = new Array(outputs);

        this.#randomize();
    }

    // speed + sensors
    forward(inputs, backprop = true) {
        const m = this.weights;
        const x = inputs;
        this.inputs = x;
        if (backprop) this.backwardStoreIn = x;

        // output = input * weights + bias
        let y = new Array(this.outputs.length);
        for (let i = 0; i < this.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < this.inputs.length; j++) {
                sum += x[j] * m[j][i];
            }
            // activate output
            const preActive = sum;
            if (backprop) this.backwardStoreOut[i] = preActive;
            y[i] = this.activation ? this.activation.forward(preActive) : preActive;
        }

        this.outputs = y;
        return y;
    }

    backward(delta) {
        const lr = this.lr;
        const weights = this.weights;
        const x = this.inputs;
        const y = this.backwardStoreOut;

        for (let i = 0; i < x.length; i++) {
            for (let j = 0; j < y.length; j++) {
                const d = -lr * x[i] * delta[j];
                weights[i][j] += d;
            }
        }

        let nextDelta = new Array(x.length).fill(0);
        for (let i = 0; i < x.length; i++) {
            for (let j = 0; j < y.length; j++) {
                nextDelta[i] += delta[j] * weights[i][j] * y[j];
            }
        }

        return nextDelta;
    }

    loadWeights(weights) {
        if (weights.length !== this.weights.length) return
        for (let i = 0; i < this.weights.length; i++) {
            if (weights[i].length !== this.weights[i].length) return
        }
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                this.weights[i][j] = weights[i][j];
            }
        }
    }

    updateWeights(gradient) {
        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i] -= gradient[i] * this.lr;
        }
    }

    #randomize() {
        for (let i = 0; i < this.inputs.length; i++) {
            for (let j = 0; j < this.outputs.length; j++) {
                this.weights[i][j] = Math.random() * 2 - 1;
            }
        }
    }
}

// Mean squared error
function MSE(actual, expected) {
    let error = new Array(actual.length);
    for (let i = 0; i < actual.length; i++) {
        error[i] = (actual[i] - expected[i]) ** 2;
    }
    return error.reduce((a, b) => a + b);
}

class Sigmoid {
    constructor() {
        this.forward = x => 1 / (1 + Math.exp(-x));
        this.backward = x => this.forward(x) * (1 - this.forward(x));
    }
}

class Tanh {
    constructor() {
        this.forward = x => Math.tanh(x);
        this.backward = x => {
            const regular = this.forward(x);
            return 1 - regular * regular;
        };
    }
}

class Relu {
    constructor() {
        this.forward = x => Math.max(0, x);
        this.backward = x => x > 0 ? 1 : 0;
    }
}

class LeakyRelu {
    constructor(alpha = 0.01) {
        this.alpha = alpha;
        this.forward = x => x > 0 ? x : x * this.alpha;
        this.backward = x => x > 0 ? 1 : this.alpha;
    }
}
