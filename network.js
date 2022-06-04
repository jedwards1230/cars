import { lerp } from "./utils/utils.js";

export class Network {
    constructor(car, env) {
        this.env = env;
        this.layers = [];
        this.memory = [];
        this.epsilon = 0.5;

        // +2 for inital inputs in car sensor data
        let neurons = [car.sensors[0].rayCount + 3, 6, 12, 2];
        for(let i=0; i<neurons.length-2; i++) {
            this.layers.push(new Level(neurons[i], neurons[i+1], new Relu()));
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

    backward(actionValues, experimentalValues) {
        let delta = [];
        for(let i=0; i<actionValues.length; i++) {
            delta[i] = (actionValues[i] + experimentalValues[i])/2;
        }
        for(let i=this.layers.length-1; i>=0; i--) {
            delta = this.layers[i].backward(delta);
        }
    }

    reward(m) {
        if(m.damaged) {
            return -3;
        } else if(m.speed < 0 || m.next_distance < 1) {
            return -2;
        } else if(m.prev_distance + 1 > m.next_distance) {
            return -1;
        } else {
            let n = 2 * (m.next_distance - m.prev_distance);
            return parseFloat(n.toFixed(3));
        }
    }

    experienceReplay(batchSize=20) {
        if(this.memory.length < batchSize) {
            return;
        }

        const gamma = 0.95;
        let idx = Math.floor(Math.random()*this.memory.length/batchSize);
        let batch_indices = this.memory[idx];
        for(let i=0; i<batch_indices.length; i++) {
            let [metrics, new_observation, prev_observation] = this.memory[i];
            const actionValues = this.forward(prev_observation);
            const nextActionValues = this.forward(new_observation, false);
            let experimentalValues = JSON.parse(JSON.stringify(actionValues));

            for(let i=0; i<actionValues.length; i++) {
                if(i == metrics.action) {
                    experimentalValues[i] *= metrics.reward;
                    if(metrics.reward > 0) {
                        experimentalValues[i] += gamma * Math.max(...nextActionValues);
                        //console.log("experimentalValues", experimentalValues, "nextActionValues", nextActionValues);
                    }
                } else {
                    experimentalValues[i] *= -metrics.reward;
                }
            }

            this.backward(actionValues, experimentalValues);

            // epsilon decay
            if(this.epsilon > 0.01) {
                this.epsilon *=  0.997;
            } 

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

    // as epsilon decays, the network will be more likely to explore
    selectAction(observation) {
        const actionValues = this.forward(observation, false);
        const random = Math.random();
        /* if(random > this.epsilon) {
            return Math.floor(Math.random()*actionValues.length);
        } else {
            return actionValues.indexOf(Math.max(...actionValues));
        } */
        return actionValues.indexOf(Math.max(...actionValues));
    }

    remember(metrics, observation, prev_observation) {
        this.memory.push([metrics, observation, prev_observation]);
    }

    updateLevels(levels) {
        for(let i=0; i<this.layers.length; i++) {
            this.layers[i].weights = levels[i].weights;
            this.layers[i].biases = levels[i].biases;
        }
    }

    // function to find mean squared error between two values
    MSE(expected, actual) {
        return Math.pow(expected - actual, 2);
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
        let output = new Array(this.outputs.length);
        let sums = [];
        if(backprop) this.backwardStoreIn = inputs;

        // output = activation(sum(weights*inputs + biases))
        for(let i=0; i<this.outputs.length; i++) {
            let sum = 0;
            // weights * inputs + bias
            for(let j=0; j<this.inputs.length; j++) {
                sum += inputs[j] * this.weights[j] + this.biases[i];
            }

            if(backprop) this.backwardStoreOut[i] = sum;

            // activation
            if(this.activation) output[i] = this.activation.forward(sum);

            sums.push(sum);
        }
        this.inputs = inputs;
        this.outputs = output;

        return output;
    }

    backward(gradient) {
        // update biases with gradient
        this.updateBiases(gradient);

        let adjustedGradient = JSON.parse(JSON.stringify(gradient));
        let stored;
        // derive activation function
        if(this.activation) {
            stored = this.backwardStoreOut;
            //stored = this.activation.backward(this.backwardStoreOut);
            // update adjusted gradient with stored outputs
            for(let i=0; i<adjustedGradient.length; i++) {
                adjustedGradient[i] = stored[i] * gradient[i];
            }
        }

        let nextGradient = new Array(this.inputs.length).fill(0);
        for(let i=0; i<this.inputs.length; i++) {
            if(this.backwardStoreIn[i] != 0) {
                for(let j=0; j<this.outputs.length; j++) {
                    nextGradient[i] += this.backwardStoreIn[i] * adjustedGradient[j];
                }
            }
        }
        this.updateWeights(nextGradient);

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
        }
        return
    }

    // function to find mean squared error between two values
    MSE(expected, actual) {
        return Math.pow(expected - actual, 2);
    }
}

class Sigmoid {
    constructor() {
        this.forward = this.forward;
        this.backward = this.backward;
    }

    forward(n) {
        return 1 / (1 + Math.exp(-n));
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

    forward(n) {
        if(n > 0) {
            return n;
        } else {
            return 0;
        }
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