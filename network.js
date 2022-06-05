import { lerp, getRandomInt } from "./utils/utils.js";

export class Network {
    constructor(car, env) {
        this.env = env;
        this.layers = [];
        this.memory = [];
        this.epsilon = 0.5;

        // +2 for inital inputs in car sensor data
        let neurons = [car.sensors[0].rayCount + 2, 8, 12, 16, 2];
        this.layers.push(new Level(neurons[0], neurons[1]));
        if(neurons.length > 2) {
            for(let i=1; i<neurons.length-2; i++) {
                this.layers.push(new Level(neurons[i], neurons[i+1], new Relu()));
            }
        }
        this.layers.push(new Level(neurons[neurons.length-2], neurons[neurons.length-1], new Sigmoid()));
    }

    forward(inputs, backprop=true) {
        let outputs = this.layers[0].forward(inputs, backprop);
        for(let i=1; i<this.layers.length; i++) {
            outputs = this.layers[i].forward(outputs, backprop);
        }
        return outputs;
    }

    backward(delta) {
        for(let i=this.layers.length-1; i>=0; i--) {
            delta = this.layers[i].backward(delta);
        }
    }

    reward(m) {
        if(m.damaged) {
            return -1;
        } else if(m.speed < 0 || m.next_distance < 1) {
            return 0;
        } else if(Math.max(m.sensorOffsets) >= 0.8) {
            return 0;
        } else if(Math.max(m.sensorOffsets) < 0.8) {
            return 2;
        } else {
            return 1;
        }
    }

    experienceReplay(batchSize=20) {
        if(this.memory.length < batchSize) return;

        let i = getRandomInt(0, this.memory.length - batchSize - 1);
        for(i; i<batchSize; i++) {
            let [metrics, action, new_observation, prev_observation] = this.memory[i];
            const actualValues = this.forward(prev_observation);
            const nextActualValues = this.forward(new_observation, false);
            const deltaGradient = this.getDelta(metrics.reward, action, actualValues, nextActualValues);

            this.backward(deltaGradient);

            // epsilon decay
            if(this.epsilon > 0.01) this.epsilon *=  0.997;

            // learning rate decay
           for(let i=this.layers.length-1; i>=0; i--) {
                if(this.layers[i].lr > 0.0001) {
                    this.layers[i].lr *= 0.995;
                    //this.layers[i].lr = parseFloat(this.layers[i].lr.toFixed(8));
                } else {
                    this.layers[i].lr = 0.0001;
                }
            }
        }
    }

    getDelta(reward, action, actual, nextActual) {
        const gamma = 0.95;
        const nextOut = Math.max(...nextActual)
        let delta = [];
        for(let i=0; i<actual.length; i++) {
            delta[i] = -(reward - actual[i]) * actual[i] * gamma * nextOut;
        }
        delta[action] *= -1;
        return delta;
    }

    // as epsilon decays, the network will be more likely to explore
    selectAction(observation) {
        const actionValues = this.forward(observation, false);
        return actionValues.indexOf(Math.max(...actionValues));
        /* const random = Math.random();
        if(random < this.epsilon) {
            // choose random
            return Math.floor(Math.random()*actionValues.length);
        } else {
            // choose highest score
            return actionValues.indexOf(Math.max(...actionValues));
        } */
    }

    remember(metrics, action, observation, prev_observation) {
        this.memory.push([metrics, action, observation, prev_observation]);
    }

    updateLevels(levels) {
        for(let i=0; i<this.layers.length; i++) {
            this.layers[i].weights = levels[i].weights;
            this.layers[i].biases = levels[i].biases;
        }
    }

    save() {
        let state = [];
        for(let i=0; i<this.layers.length; i++) {
            state.push({
                weights: this.layers[i].weights,
                biases: this.layers[i].biases,
            });
        }
        return state;
    }

    static mutate(network, amount=1) {
        network.layers.forEach(level => {
            for(let i=0; i<level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount,
                )
                }
            for(let i=0; i<level.weights.length; i++) {
                for(let j=0; j<level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount,
                    )
                }
            }
        });
    }
}

class Level {
    constructor(inputs, outputs, activation=null) {
        this.activation = activation;
        this.lr = 0.01;

        this.backwardStoreIn = new Array(inputs);
        this.backwardStoreOut = new Array(outputs);

        this.inputs = new Array(inputs);
        this.weights = new Array(inputs);

        this.outputs = new Array(outputs);
        this.biases = new Array(outputs);

        this.#randomize();
    }

    // speed + sensors
    forward(inputs, backprop=true) {
        const l_inputs = inputs;
        let l_output = new Array(this.outputs.length);
        if(backprop) this.backwardStoreIn = l_inputs;

        this.backwardSum = 0;
        for(let j=0; j<this.inputs.length; j++) {
            this.backwardSum += l_inputs[j] * this.weights[j];
        }

        // output = input * weights + bias
        for(let i=0; i<this.outputs.length; i++) {
            const preActive = this.backwardSum + this.biases[i];
            if(backprop) this.backwardStoreOut[i] = this.backwardSum + this.biases[i];

            // activation function
            const out = this.activation ? this.activation.forward(preActive) : preActive;
            l_output[i] = parseFloat(out.toFixed(16));
        }
        this.inputs = l_inputs;
        this.outputs = l_output;

        return l_output;
    }

    // unbalanced without activation function
    backward(gradient) {
        for(let i=0; i<gradient.length; i++) {
            if(!isFinite(gradient[i])) {
                console.log('gradient', gradient);
            }
        }
        let nextGradient = new Array(this.inputs.length).fill(0);

        // update adjusted gradient with stored outputs
        for(let i=0; i<this.outputs.length; i++) {
            for(let j=0; j<this.inputs.length; j++) {
    
                nextGradient[j] = gradient[i] * this.lr * this.backwardStoreOut[i];
                //nextGradient[j] = Math.tanh(nextGradient[j])
            }
        }

        // update biases with gradient
        this.updateBiases(gradient);
        this.updateWeights(nextGradient);

        for(let i=0; i<nextGradient.length; i++) {
            if(!isFinite(nextGradient[i])) {
                console.log('next gradient', nextGradient);
            }
        }

        return nextGradient;
    }

    #randomize() {
        for(let i=0; i<this.inputs.length; i++) {
            this.weights[i] = Math.random() * 2 - 1;
        }

        for(let i=0; i<this.biases.length; i++) {
            this.biases[i] = Math.random() * 2 - 1;
        }
    }

    updateWeights(gradient) {
        for(let i=0; i<this.inputs.length; i++) {
            this.weights[i] += this.lr * gradient[i];
        }
        return
    }

    updateBiases(gradient) {
        for(let i=0; i<this.outputs.length; i++) {
            this.biases[i] += this.lr * gradient[i];
            if(!isFinite(this.biases[i])) console.log(this.biases, this.lr, gradient[i]);
        }
        return
    }
}

// function to find mean squared error between two values
function MSE(expected, actual) {
    const x = Math.pow(expected - actual, 2);
    return parseFloat(x.toFixed(16));
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

class Sigmoid {
    constructor() {
        this.forward = (x) => {
            return 1 / (1 + Math.exp(-x));
        }
        this.backward = (inputs) => {
            return inputs.map(x => x * (1 - x));
        }
    }
}

class Tanh {
    constructor() {
        this.forward = (x) => {
            return Math.tanh(x);
        }
        this.backward = (inputs) => {
            return inputs.map(x => 1 - Math.pow(x, 2));
        }
    }
}

class Relu {
    constructor() {
        this.forward = (x) => {
            return x > 0 ? 1 : 0;
        }
        this.backward = (inputs) => {
            return inputs.map(x => x > 0 ? 1 : 0);
        }
    }
}