import { lerp, getRandomInt } from "./utils/utils.js";

export class Network {
    constructor(car, env) {
        this.env = env;
        this.layers = [];
        this.memory = [];
        this.epsilon = 0.3;
        this.confidence = 0.5;

        // +2 for inital inputs in car sensor data
        let neurons = [car.sensors[0].rayCount + 2, 10, 12, 6, 2];
        this.layers.push(new Level(neurons[0], neurons[1], new Tanh()));
        if(neurons.length > 2) {
            for(let i=1; i<neurons.length-2; i++) {
                this.layers.push(new Level(neurons[i], neurons[i+1], new Tanh()));
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
        let mOffset = Math.max(...m.sensorOffsets);
        let reward = 1;

        if(m.damaged) return -5;
        if(m.speeds[m.speeds.length - 1] < 0 || m.distances[m.distances.length - 2] < 0 || m.distances[m.distances.length - 1] < 1) return -reward - 1;
        if(mOffset >= 0.5) return -reward * 0.5 - 1;

        reward -= mOffset;
        if(m.prev_distance < m.next_distance) reward += (m.distances[m.distances.length - 1] - m.distances[m.distances.length - 2]) * 0.5;
        return reward;
    }

    experienceReplay(batchSize=20, damaged=false) {
        if(this.memory.length < batchSize) return;

        let idx = getRandomInt(1, this.memory.length - batchSize - 1);
        if(damaged) {
            idx = this.memory.length - batchSize - 1;
        }
        if(idx < 1) return;
        
        for(let i = idx; i<batchSize; i++) {
            if(this.memory[i] === undefined) {
                break;
            }
            let [metrics, action, new_observation, prev_observation] = this.memory[i];
            const actualValues = this.forward(prev_observation);
            const nextActualValues = this.forward(new_observation, false);
            const deltaGradient = this.getDelta(metrics.reward, action, actualValues, nextActualValues);

            this.backward(deltaGradient);

            // epsilon decay
            if(this.epsilon > 0.01) this.epsilon *=  0.99;

            // learning rate decay
            for(let i=this.layers.length-1; i>=0; i--) {
                this.layers[i].lr = this.layers[i].lr > 0.0001 ? this.layers[i].lr * 0.99 : 0.0001;
            }
        }
    }

    getDelta(reward, action, actual, nextActual) {
        const gamma = 0.95;
        const nextOut = Math.max(...nextActual)
        let delta = [];
        for(let i=0; i<actual.length; i++) {
            delta[i] = -(reward + nextOut - actual[i]) * this.layers[0].lr;
        }
        delta[action] *= -1;
        return delta;
    }

    // as epsilon decays, the network will be more likely to explore
    selectAction(observation, randomChance = false) {
        const actionValues = this.forward(observation, false);
        const random = Math.random();
        if(randomChance && random < this.epsilon) {
            // choose random
            return Math.floor(Math.random()*actionValues.length);
        }
        // choose highest score
        const m = Math.max(...actionValues);
        return actionValues.indexOf(m);
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
        this.lr = 0.001;

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
        this.inputs = inputs;
        if(backprop) this.backwardStoreIn = inputs;

        let activatedInput = 0;
        for(let j=0; j<this.inputs.length; j++) {
            activatedInput += inputs[j] * this.weights[j];
        }

        // output = input * weights + bias
        let activatedOutput = new Array(this.outputs.length);
        for(let i=0; i<this.outputs.length; i++) {
            // activate output
            const preActive = activatedInput + this.biases[i];
            if(backprop) this.backwardStoreOut[i] = preActive;
            activatedOutput[i] = this.activation ? this.activation.forward(preActive) : preActive;
        }
        this.outputs = activatedOutput;

        return activatedOutput;
    }

    // unbalanced without activation function
    backward(gradient) {
        let balancedOut = JSON.parse(JSON.stringify(gradient));
        // update adjusted gradient with stored outputs
        for(let i=0; i<balancedOut.length; i++) {
            balancedOut[i] *= this.lr * this.backwardStoreOut[i];
        }

        let adjustedOut = [balancedOut];
        let adjustedIn = transpose([this.backwardStoreIn]);
        const D_i = multiplyGradients(adjustedIn, adjustedOut);
        const delta_i = this.findDelta(balancedOut);

        // update biases with gradient
        this.updateBiases(gradient);
        this.updateWeights(D_i);

        return delta_i;
    }

    findDelta(gradient) {
        let delta = new Array(this.inputs.length).fill(0);
        for(let i=0; i<this.inputs.length; i++) {
            for(let j=0; j<this.outputs.length; j++) {
                delta[i] += this.weights[i] * gradient[j];
            }
        }
        return delta
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
        let squish = false;
        for(let i=0; i<this.inputs.length; i++) {
            for(let j=0; j<this.outputs.length; j++) {
                this.weights[i] += this.lr * gradient[i][j];
                if(this.weights[i] > 2 || this.weights[i] < -2) {
                    squish = true;
                }
            }
        }
        if(squish) {
            for(let i=0; i<this.weights.length; i++) {
                this.weights[i] /= 2;
            }
        }
    }

    updateBiases(gradient) {
        let squish = false;
        for(let i=0; i<this.outputs.length; i++) {
            this.biases[i] += this.lr * gradient[i];
            if(this.biases[i] > 2 || this.biases[i] < -2) {
                squish = true;
            }
        }
        if(squish) {
            for(let i=0; i<this.biases.length; i++) {
                this.biases[i] /= 2;
            }
        }
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

function multiplyGradients(a,b) {
	return a.map(function(x,i) {
		return transpose(b).map(function(y,k) {
			return dotproduct(x, y)
		});
	});
}

function dotproduct(a,b) {
	return a.map(function(x,i) {
		return a[i] * b[i];
	}).reduce(function(m,n) { return m + n; });
}

function transpose(a) {
	return a[0].map(function(x,i) {
		return a.map(function(y,k) {
			return y[i];
		})
	});
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
            return x > 0 ? x : 0;
        }
        this.backward = (inputs) => {
            return inputs.map(x => x > 0 ? 1 : 0);
        }
    }
}