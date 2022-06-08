import { lerp, getRandomInt } from "../utils/utils.js";

export class Network {
    constructor(car, env) {
        this.env = env;
        this.layers = [];
        this.memory = [];
        this.epsilon = 0.3;
        this.confidence = 0.5;

        this.inputs = new Array(car.sensors[0].rayCount + 1);
        this.outputs = new Array(2);;

        // +2 for inital inputs in car sensor data
        let neurons = [this.inputs.length, 10, 10, this.outputs.length];
        for(let i=0; i<neurons.length - 1; i++) {
            this.layers.push(new Level(neurons[i], neurons[i+1], new Sigmoid()));
        }
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

        if(m.damaged) return -2;
        if(m.speeds[m.speeds.length - 1] < 0 || m.distances[m.distances.length - 2] - 1 < 0 || m.distances[m.distances.length - 1] < 1) return -1;
        if(mOffset >= 0.5) return -1;

        let reward = 1 - mOffset + 1;
        if(m.prev_distance < m.next_distance) reward += 0.5;
        return reward;
    }

    experienceReplay(batchSize=30, damaged=false) {
        if(this.memory.length <= batchSize) return null;

        let idx = getRandomInt(1, this.memory.length - batchSize - 1);
        if(damaged) {
            idx = this.memory.length - batchSize - 1;
        }

        let avgLoss = 0;

        for(let i = idx; i<batchSize; i++) {
            let [metrics, action, new_observation, prev_observation] = this.memory[i];
            const actualValues = this.forward(prev_observation);
            const nextActualValues = this.forward(new_observation, false);
            const nextAction = metrics.damaged ? 0 : Math.max(...nextActualValues);

            const delta = this.getGradient(metrics.reward, actualValues, action, nextAction);

            const error = this.getErrorGradient(actualValues, delta);
            const totalError = error.reduce((a, b) => a + b);
            avgLoss += totalError;

            let alpha = new Array(actualValues.length).fill(0);
            for (let i = 0; i < actualValues.length; i++) {
                alpha[i] = actualValues[i] + delta[i];
            }

            this.backward(alpha);

            // epsilon decay
            if(this.epsilon > 0.01) this.epsilon *=  0.99;

            // learning rate decay
            for(let i=this.layers.length-1; i>=0; i--) {
                this.layers[i].lr = this.layers[i].lr > 0.0001 ? this.layers[i].lr * 0.99 : 0.0001;
            }
        }
        return avgLoss / batchSize;
    }

    getErrorGradient(predicted, expected) {
        let error = [];
        for(let i=0; i<predicted.length; i++) {
            error[i] = (predicted[i] - expected[i]) ** 2;
        }
        return error;
    }

    getGradient(reward, actionValues, action, next) {
        const gamma = 0.995;
        let gradient = new Array(actionValues.length).fill(0);
        for(let i=0; i<actionValues.length; i++) {
            const expected = reward + (gamma * next) - actionValues[action];
            const delta = -reward * MSE(expected, actionValues[i]);
            gradient[i] = delta / actionValues.length;
        }
        gradient[action] *= -1;
        return gradient;
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

    loadWeights(weights) {
        for(let i=0; i<this.layers.length; i++) {
            this.layers[i].loadWeights(weights[i]);
        }
    }

    save() {
        let weights = [];
        for(let i=0; i<this.layers.length; i++) {
            weights.push(this.layers[i].weights);
        }
        return weights;
    }

    mutate(amount=1) {
        this.layers.forEach(level => {
            for(let i=0; i<level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random()*2-1,
                    amount,
                )
                }
            for(let i=0; i<level.inputs.length; i++) {
                for(let j=0; j<level.outputs.length; j++) {
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
        for (let i = 0; i < inputs; i++) {
            this.weights[i] = new Array(outputs).fill(0);
        }

        this.outputs = new Array(outputs);
        this.biases = new Array(outputs);

        this.#randomize();
    }

    // speed + sensors
    forward(inputs, backprop=true) {
        const m = this.weights;
        const b = this.biases;

        const x = inputs;

        this.inputs = x;
        if(backprop) this.backwardStoreIn = x;

        let activatedInput = 0;
        for(let j=0; j<x.length; j++) {
            activatedInput += x[j] * m[j];
        }

        // output = input * weights + bias
        let y = new Array(this.outputs.length);
        for(let i=0; i<this.outputs.length; i++) {
            let sum = 0;
            for (let j=0; j<this.inputs.length; j++) {
                sum += x[j] * m[j][i];
            }
            // activate output
            const preActive = sum;
            if(backprop) this.backwardStoreOut[i] = preActive;
            y[i] = this.activation ? this.activation.forward(preActive) : preActive;
        }

        this.outputs = y;
        return y;
    }

    backward(delta) {
        const a = this.lr;
        const m = this.weights;
        const x = this.inputs;
        const y = this.backwardStoreOut;

        for(let i=0; i<x.length; i++) {
            for(let j=0; j<y.length; j++) {
                m[i][j] -= a * x[i] * delta[j];
            }
        }

        let nextDelta = new Array(x.length).fill(0);
        for(let i=0; i<x.length; i++) {
            for(let j=0; j<y.length; j++) {
                nextDelta[i] += delta[j] * m[i][j] * y[j];
            }
        }
        
        return nextDelta;
    }

    loadWeights(weights) {
        for(let i=0; i<this.weights.length; i++) {
            for(let j=0; j<this.weights[i].length; j++) {
                this.weights[i][j] = weights[i][j];
            }
        }
    }

    updateWeights(gradient) {
        for(let i=0; i<this.weights.length; i++) {
            this.weights[i] -= gradient[i] * this.lr;
        }
    }

    updateBiases(gradient) {
        for(let i=0; i<this.biases.length; i++) {
            this.biases[i] -= gradient[i] * this.lr;
        }
    }

    #randomize() {
        for(let i=0; i<this.inputs.length; i++) {
            for(let j=0; j<this.outputs.length; j++) {
                this.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for(let i=0; i<this.biases.length; i++) {
            this.biases[i] = Math.random() * 2 - 1;
        }
    }
}

// function to find mean squared error between two values
function MSE(expected, actual) {
    return Math.pow(actual - expected, 2);
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
	return a.map( (x,i) => {
		return a[i] * b[i];
	}).reduce( (m,n) => { return m + n; });
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