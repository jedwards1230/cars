import { lerp } from "./utils/utils.js";

export class Network {
    constructor(car, env) {
        this.env = env;
        this.layers = [];
        this.memory = [];
        this.gamma = 0.95;
        this.epsilon = 0.1;

        let neurons = [car.sensors[0].rayCount+1, 6, 12, 2];
        for(let i=0; i<neurons.length-2; i++) {
            this.layers.push(new Level(neurons[i], neurons[i+1], new Relu));
        }
        this.layers.push(new Level(neurons[neurons.length-2], neurons[neurons.length-1], new Sigmoid));
    }

    reward(metrics) {
        let reward = 0;
        if(metrics.damaged) {
            reward -= 1;
        } 
        if(metrics.distances[0] >= metrics.distances[1] || metrics.distances[1] < 1) {
            reward -= 1;
        } else {
            reward += 1 + this.gamma;
        }
        if(metrics.speed < 0.1) {
            reward -= 1;
        } else {
            reward += 1 + this.gamma;
        }
        
        return reward;
    }

    experienceReplay(batchSize=20) {
        if(this.memory.length < batchSize) {
            return;
        } else {
            let idx = Math.floor(Math.random()*this.memory.length/batchSize);
            let batch_indices = this.memory[idx];
            for(let i=0; i<batch_indices.length; i++) {
                let [metrics, action, new_observation, prev_observation] = this.memory[i];
                let actionValues = this.forward(prev_observation);
                let nextActionValues = this.forward(new_observation, false);
                let experimentalValues = JSON.parse(JSON.stringify(actionValues));

                for(let i=0; i<action.length; i++) {
                    if(action[i] == 1) {
                        experimentalValues[i] = metrics.reward;
                    }
                }
               
                this.backward(actionValues, experimentalValues);
                if(this.epsilon >= 0.01) {
                    this.epsilon = this.epsilon * 0.99;
                }
                // for each layer
                for(let i=this.layers.length-1; i>=0; i--) {
                    if(this.layers[i].lr >= 0.0001) {
                        this.layers[i].lr = this.layers[i].lr * 0.995;
                    }
                }
            }
        }
    }

    // todo: derivative of sigmoid and relu
    backward(actionValues, experimentalValues) {
        let delta = [];
        for(let i=0; i<actionValues.length; i++) {
            delta[i] = actionValues[i] - experimentalValues[i];
        }
        for(let i=this.layers.length-1; i>=0; i--) {
            delta = this.layers[i].backward(delta);
        }
    }

    remember(metrics, action, observation, prev_observation) {
        this.memory.push([metrics, action, observation, prev_observation]);
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
        this.weights = [];
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
        this.weights = this.weights - this.lr * gradient;
    }

    /*  write a back propagation function that:
        1: finds the derivative of the loss function
        2. calculates the gradient of the loss function
        3. updates the weights and biases
        4. returns the loss amount
    */
   backward(gradient) {
        let delta = 0;
        for(let i=0; i<gradient.length; i++) {
            delta += gradient[i] - this.biases[i];
        }
        delta /= gradient.length;
        //console.log("loss: ", delta);

        let adjustedGradient = new Array(gradient.length);

        if(this.activation) {
            for(let i=0; i<gradient.length; i++) {
                adjustedGradient[i] = this.activation.backward(gradient[i]);
            }
        }
        
        //console.log("gradient: ", gradient);
        for(let i=0; i<this.inputs.length; i++) {
            for(let j=0; j<this.outputs.length; j++) {
                this.weights[i][j] -= this.lr * adjustedGradient[j] * this.inputs[i];
            }
        }
        for(let i=0; i<this.biases.length; i++) {
            this.biases[i] -= this.lr * adjustedGradient[i];
        }

        let nextGradient = [];
        for(let i=0; i<this.backwardStoreIn.length; i++) {
            nextGradient[i] = this.backwardStoreIn[i] - delta;
        }

        return nextGradient;
    }

    // speed + sensors
    forward(inputs, backprop=true) {
        let output = new Array(this.outputsCount);
        let unactivated = new Array(this.outputsCount);
        // compute for each output (none, up, down, left, right) 
        for(let i=0; i<this.outputsCount; i++) {
            let sum = 0;
            for(let j=0; j<this.inputsCount; j++) {
                sum += inputs[j] * this.weights[j][i];
            }
            output[i] = sum;
            unactivated[i] = sum;

            if(this.activation) {
                output[i] = this.activation.forward(output[i]);
            }
        }

        if(backprop) {
            this.backwardStoreIn = inputs;
            this.backwardStoreOut = unactivated;
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

    forward(z) {
        const k = 2;
        return 1 / (1 + Math.exp(-z/k));
    }

    backward(z) {
        return z * (1 - z);
    }
}

class Relu {
    constructor() {
        this.forward = this.forward;
        this.backward = this.backward;
    }

    forward(x) {
        return x > 0 ? x : 0;
    }

    backward(x) {
        return x > 0 ? 0 : 1;
    }
}