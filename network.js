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

    reward(metrics) {
        let reward = 0;
        if(metrics.damaged) {
            reward -= 3;
        } else {
            reward += 2;
            if(metrics.speed < 0.1) {
                reward -= 4;
            } else {
                reward += 2;
                
            }
            if(metrics.distances[1] <= 1) {
                reward -= 1;
            } else {
                reward += 1;
                if(metrics.distances[0] + 1 > metrics.distances[1]) {
                    reward -= 2;
                } else {
                    reward += 3;
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

                console.log("metrics", metrics);
                this.backward(actionValues, experimentalValues);
                if(this.epsilon > 0.01) {
                    this.epsilon *=  0.997;
                } 
                // for each layer
                for(let i=this.layers.length-1; i>=0; i--) {
                    if(this.layers[i].lr >= 0.0001) {
                        this.layers[i].lr *= 0.995;
                    }
                }
            }
        }
    }

    // as epsilon decays, the network will be more likely to explore
    selectAction(observation) {
        const action = this.forward(observation);
        const random = Math.random();
        if(random > this.epsilon) {
            return Math.floor(Math.random()*action.length);
        } else {
            return action.indexOf(Math.max(...action));
        }
    }

    backward(actionValues, experimentalValues) {
        let delta = [];
        //console.log("actionValues", actionValues, "experimentalValues", experimentalValues);
        for(let i=0; i<actionValues.length; i++) {
            delta[i] = actionValues[i] - experimentalValues[i];
        }
        //console.log("delta", delta);
        for(let i=this.layers.length-1; i>=0; i--) {
            delta = this.layers[i].backward(delta);
        }
    }

    remember(metrics, observation, prev_observation) {
        this.memory.push([metrics, observation, prev_observation]);
    }

    forward(inputs, backprop=true) {
        let outputs = this.layers[0].forward(inputs, backprop);
        //console.log(0, outputs);
        for(let i=1; i<this.layers.length; i++) {
            outputs = this.layers[i].forward(outputs, backprop);
            //console.log(i, outputs);
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

        let adjustedGradient = JSON.parse(JSON.stringify(gradient));

        if(this.activation) {
            for(let i=0; i<gradient.length; i++) {
                adjustedGradient[i] = this.activation.backward(this.backwardStoreOut[i] - gradient[i]);
            }
        }
        
        for(let i=0; i<this.inputs.length; i++) {
            for(let j=0; j<this.outputs.length; j++) {
                this.weights[i][j] -= this.lr * adjustedGradient[j] - this.inputs[i];
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
                //console.log(inputs[j], this.weights[j][i]);
                sum += inputs[j] * this.weights[j][i];
            }
            output[i] = sum / this.inputsCount;
            unactivated[i] = sum / this.inputsCount;


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