import { lerp } from "./utils/utils.js";

export class Network {
    constructor(car, env) {
        this.env = env;
        this.layers = [];
        this.memory = [];
        this.epsilon = 0.5;

        // +2 for inital inputs in car sensor data
        let neurons = [car.sensors[0].rayCount+2, 6, 12, 2];
        for(let i=0; i<neurons.length-2; i++) {
            this.layers.push(new Level(neurons[i], neurons[i+1], new Relu()));
        }
        this.layers.push(new Level(neurons[neurons.length-2], neurons[neurons.length-1], new Sigmoid()));
    }

    reward(m) {
        let reward = 0;
        if(m.damaged) {
            return -10;
        } else {
            reward += 1;
            if(m.speed < 0.1) {
                return -1;
            } else {
                reward += 2;
            }
            if(m.next_distance < 1) {
                return -1;
            } else {
                reward += 2;
                if(m.prev_distance + 1 > m.next_distance) {
                    return -1;
                } else {
                    reward += 3 * Math.abs(m.prev_distance + 1 - m.next_distance);
                }
            }
        }
        
        return reward;
    }

    experienceReplay(batchSize=20) {
        const gamma = 0.95;
        if(this.memory.length > batchSize) {
            let idx = Math.floor(Math.random()*this.memory.length/batchSize);
            let batch_indices = this.memory[idx];
            for(let i=0; i<batch_indices.length; i++) {
                let [metrics, new_observation, prev_observation] = this.memory[i];
                const actionValues = this.forward(prev_observation);
                const nextActionValues = this.forward(new_observation, false);
                let experimentalValues = JSON.parse(JSON.stringify(actionValues));

                experimentalValues[metrics.action] = metrics.reward;
                if(metrics.reward > 0) {
                    experimentalValues[metrics.action] += gamma * Math.max(...nextActionValues);
                    //console.log("experimentalValues", experimentalValues, "nextActionValues", nextActionValues);
                }

                //console.log("metrics", metrics);
                this.backward(actionValues, experimentalValues);
                if(this.epsilon > 0.01) {
                    this.epsilon *=  0.997;
                } 
                // for each layer
                for(let i=this.layers.length-1; i>=0; i--) {
                    if(this.layers[i].lr > 0.0001) {
                        this.layers[i].lr *= 0.9;
                        this.layers[i].lr = parseFloat(this.layers[i].lr.toFixed(8));
                    }
                }
            }
        }
    }

    // as epsilon decays, the network will be more likely to explore
    selectAction(observation) {
        const actionValues = this.forward(observation);
        const random = Math.random();
        /* if(random > this.epsilon) {
            return Math.floor(Math.random()*actionValues.length);
        } else {
            return actionValues.indexOf(Math.max(...actionValues));
        } */
        return actionValues.indexOf(Math.max(...actionValues));
    }

    backward(actionValues, experimentalValues) {
        let delta = [];
        for(let i=0; i<actionValues.length; i++) {
            delta[i] = actionValues[i] - experimentalValues[i];
        }
        for(let i=this.layers.length-1; i>=0; i--) {
            delta = this.layers[i].backward(delta);
        }
    }

    remember(metrics, observation, prev_observation) {
        this.memory.push([metrics, observation, prev_observation]);
    }

    forward(inputs, backprop=true) {
        let outputs = this.layers[0].forward(inputs, backprop);
        for(let i=1; i<this.layers.length; i++) {
            outputs = this.layers[i].forward(outputs, backprop);
        }
        return outputs;
    }

    updateLevels(weights) {
        this.layers.weights = weights;
    }

    save() {
        let state = [];
        for(let i=0; i<this.layers.length; i++) {
            state.push({
                weights: this.layers[i].getWeights(),
                biases: this.layers[i].getBiases()
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
        this.inputsCount = inputs;
        this.outputsCount = outputs;
        this.activation = activation;
        this.weights = new Array(inputs);
        this.biases = new Array(outputs);

        this.inputs = new Array(inputs);
        this.outputs = new Array(outputs);

        this.lr = 0.001;
        
        for(let i=0; i<inputs; i++) {
            this.weights[i] = new Array(outputs);
        }

        Level.#randomize(this);
    }

    getWeights() {
        return this.weights;
    }

    getBiases() {
        return this.biases;
    }

    static #randomize(level) {
        for(let i=0; i<level.inputsCount; i++) {
            for(let j=0; j<level.outputsCount; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for(let i=0; i<level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    updateWeights(gradient) {
        for(let i=0; i<this.inputs.length; i++) {
            for(let j=0; j<this.outputs.length; j++) {
                this.weights[i][j] -= this.lr * gradient[j] - this.inputs[i];
            }
        }
    }

    updateBiases(gradient) {
        for(let i=0; i<this.biases.length; i++) {
            this.biases[i] -= this.lr * gradient[i];
        }
    }

    backward(gradient) {
        // compute mean squared error
        let adjustedGradient = JSON.parse(JSON.stringify(gradient));

        // derive activation function
        if(this.activation) {
            const stored = this.activation.backward(this.backwardStoreOut);
            for(let i=0; i<adjustedGradient.length; i++) {
                adjustedGradient[i] *= stored[i];
            }
        }

        // update biases with gradient
        this.updateBiases(adjustedGradient);

        let nextGradient = [];
        for(let i=0; i<this.inputs.length; i++) {
            nextGradient[i] = 0;
            for(let j=0; j<this.outputs.length; j++) {
                nextGradient[i] += this.backwardStoreIn[i] * adjustedGradient[j];
            }
            nextGradient[i] /= this.outputs.length;
            nextGradient[i] = parseFloat(nextGradient[i].toFixed(8));
        }
        this.updateWeights(nextGradient);

        return nextGradient;
    }

    // function to find mean squared error between two values
    MSE(expected, actual) {
        let error = 0;
        for(let i=0; i<expected.length; i++) {
            error += Math.pow(expected[i] - actual[i], 2);
        }
        return error / expected.length;
    }

    // speed + sensors
    forward(inputs, backprop=true) {
        let output = new Array(this.outputsCount);
        // compute for each output (none, up, down, left, right) 
        let sums = [];
        for(let i=0; i<this.outputsCount; i++) {
            let sum = 0;
            for(let j=0; j<this.inputsCount; j++) {
                sum += inputs[j] * this.weights[j][i];
            }
            output[i] = sum / this.inputsCount;
            sums.push(sum);
        }

        if(backprop) {
            this.backwardStoreIn = inputs;
            this.backwardStoreOut = JSON.parse(JSON.stringify(output));
        }

        if(this.activation) {
            output = this.activation.forward(output);
        }

        this.inputs = inputs;
        this.outputs = output;

        return output;
    }
}

class Sigmoid {
    constructor() {
        this.forward = this.forward;
        this.backward = this.backward;
    }

    forward(inputs) {
        let output = [];
        const k = 2
        for(let i=0; i<inputs.length; i++) {
            output[i] = 1 / (1 + Math.exp(-inputs[i]/2));
        }
        return output;
    }

    backward(inputs) {
        let output = [];
        for(let i=0; i<inputs.length; i++) {
            output[i] = inputs[i] * (1 - inputs[i]);
        }
        return output;
    }
}

class Relu {
    constructor() {
        this.forward = this.forward;
        this.backward = this.backward;
    }

    forward(inputs) {
        let output = [];
        for(let i=0; i<inputs.length; i++) {
            if(inputs[i] > 0) {
                output[i] = inputs[i];
            } else {
                output[i] = 0;
            }
        }
        return output;
    }

    backward(inputs) {
        let output = [];
        for(let i=0; i<inputs.length; i++) {
            if(inputs[i] > 0) {
                output[i] = 1;
            } else {
                output[i] = 0;
            }
        }
        return output;
    }
}