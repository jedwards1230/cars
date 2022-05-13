class Network {
    constructor(neurons) {
        this.levels = [];
        for(let i=0; i<neurons.length-1; i++) {
            this.levels.push(
                new Level(neurons[i], neurons[i+1])
            )
        }
    }

    static forward(inputs, network) {
        let outputs = Level.forward(
            inputs, network.levels[0]
        );
        for(let i=1; i<network.levels.length; i++) {
            outputs = Level.forward(
                outputs, network.levels[i]
            );
        }
        return outputs;
    }

    static mutate(network, amount=1) {
        network.levels.forEach(level => {
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
    constructor(inputs, outputs) {
        this.inputs = new Array(inputs);
        this.outputs = new Array(outputs);
        this.biases = new Array(outputs);

        this.weights = [];
        for(let i=0; i<inputs; i++) {
            this.weights[i] = new Array(outputs);
        }

        Level.#randomize(this);
    }

    static #randomize(level) {
        for(let i=0; i<level.inputs.length; i++) {
            for(let j=0; j<level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for(let i=0; i<level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static forward(inputs, level) {
        for(let i=0; i<inputs.length; i++) {
            level.inputs[i] = inputs[i];
        }

        for(let i=0; i<level.outputs.length; i++) {
            let sum = 0;
            for(let j=0; j<level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            if(sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        return level.outputs;
    }
}