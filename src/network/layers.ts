import { lerp } from "../utils";

export class Layer {
    inputs: number[];
    outputs: number[];
    weights: number[][];
    biases: number[];
    id: number;
    lr: number;
    name!: string;

    activation!: any;
    deactivation!: any;

    constructor(config: LayerConfig) {
        this.inputs = new Array(config.inputs);
        this.outputs = new Array(config.outputs);
        this.id = -1;
        this.lr = config.lr;

        if (config.biases && config.weights) {
            this.biases = [...config.biases];
            this.weights = [...config.weights];
        } else {
            this.biases = new Array(config.outputs);
            this.weights = new Array(config.inputs);
            for (let i = 0; i < config.inputs; i++) {
                this.weights[i] = new Array(config.outputs);
            }
            this.#randomize();
        }
    }

    /** Forward propagation */
    forward(inputs: number[], backprop = false) {
        const m = this.weights;
        const x = inputs;

        const bias = this.biases;

        let preActive = new Array(this.outputs.length);
        for (let i = 0; i < this.outputs.length; i++) {
            let sum = 0;
            // input * weight
            for (let j = 0; j < this.inputs.length; j++) {
                sum += x[j] * m[j][i];
            }
            // weighted + bias
            preActive[i] = sum + bias[i];
        }

        // activate outputs
        const y = this.activation(preActive);
        if (backprop) {
            this.inputs = x;
            this.outputs = y;
        }

        return y;
    }

    /** Backward propagation */
    backward(delta: number[]) {
        const weights = this.weights;
        const x = this.inputs;
        const y = this.outputs;

        const dA = this.deactivation(y);

        // bias delta
        // dB = delta * derivative(y)
        const dB = new Array(y.length);
        for (let i = 0; i < y.length; i++) {
            dB[i] = delta[i] * dA[i];
        }

        // layer delta
        // dZ = delta * derivate(y) * weight
        const dZ = new Array(x.length).fill(0);
        for (let i = 0; i < x.length; i++) {
            for (let j = 0; j < y.length; j++) {
                dZ[i] += weights[i][j] * dB[j];
            }
        }

        // weight delta
        // dW = delta * derivate(y) * input
        const dW = new Array(x.length);
        for (let i = 0; i < x.length; i++) {
            dW[i] = new Array(y.length).fill(0);
            for (let j = 0; j < y.length; j++) {
                dW[i][j] = x[i] * dB[j];
            }
        }

        this.updateBiases(dB);
        this.updateWeights(dW);

        return dZ;
    }

    updateWeights(gradient: number[][]) {
        const m = 1 / gradient.length;
        for (let i = 0; i < gradient.length; i++) {
            for (let j = 0; j < this.outputs.length; j++) {
                this.weights[i][j] -= m * gradient[i][j] * this.lr;
            }
        }
    }

    updateBiases(gradient: number[]) {
        const m = 1 / gradient.length;
        for (let i = 0; i < this.biases.length; i++) {
            this.biases[i] -= m * gradient[i] * this.lr;
        }
    }

    save(): LayerConfig {
        return {
            id: this.id,
            activation: this.name,
            inputs: this.inputs.length,
            outputs: this.outputs.length,
            weights: this.weights,
            biases: this.biases,
            lr: this.lr,
        }
    }

    /** Randomize weights with (Math.random() * 2 - 1) */
    #randomize() {
        for (let i = 0; i < this.outputs.length; i++) {
            for (let j = 0; j < this.inputs.length; j++) {
                this.weights[j][i] = Math.random() * 2 - 1;
            }
            this.biases[i] = Math.random() * 2 - 1;
        }
    }

    mutate(amount: number, rate: number) {
        for (let i = 0; i < this.outputs.length; i++) {
            for (let j = 0; j < this.inputs.length; j++) {
                const wRnd = Math.random();
                const weightLimit = wRnd * 2 - 1;
                if (rate > wRnd) {
                    this.weights[j][i] = weightLimit;
                } else {
                    this.weights[j][i] = lerp(
                        this.weights[j][i],
                        weightLimit,
                        amount,
                    )
                }
            }
            const bRnd = Math.random();
            const biasLimit = bRnd * 2 - 1;
            if (rate > bRnd) {
                console.log("setting limit", biasLimit);
                this.biases[i] = biasLimit;
            } else {
                this.biases[i] = lerp(
                    this.biases[i],
                    biasLimit,
                    amount
                )
            }
        }
    }
}

export class SoftMax extends Layer {
    constructor(config: LayerConfig) {
        super(config);
        this.name = "SoftMax";
        this.activation = (x: number[]) => {
            const maxLogit = Math.max(...x);
            const scores = x.map(l => Math.exp(l - maxLogit));
            const denom = scores.reduce((a, b) => a + b);
            return scores.map(s => s / denom);
        }
    }
}

export class Sigmoid extends Layer {
    constructor(config: LayerConfig) {
        super(config);
        this.name = "Sigmoid";
        this.activation = (x: number[]) => {
            return x.map(x => 1 / (1 + Math.exp(-x)));
        }
        this.deactivation = (x: number[]) => {
            return x.map(x => x * (1 - x));
        }        
    }
}

export class LeakyRelu extends Layer {
    alpha: number;

    constructor(config: LayerConfig, alpha = 0.01) {
        super(config);
        this.name = "LeakyRelu";
        this.alpha = alpha;
        this.activation = (x: number[]) => {
            return x.map(x => x > 0 ? x : x * this.alpha);
        }
        this.deactivation = (x: number[]) => {
            return x.map(x => x > 0 ? 1 : this.alpha);
        }
    }
}

export class DropOut extends Layer {
    dropRate: number;

    constructor(config: LayerConfig, dropRate = 0.5) {
        super(config);
        this.name = "DropOut";
        this.dropRate = dropRate;
        this.activation = (x: number[]) => {
            return x.map(x => Math.random() < this.dropRate ? 0 : x);
        }
    }
}

export class Tanh extends Layer {
    constructor(config: LayerConfig) {
        super(config);
        this.name = "Tanh";
        this.activation = (x: number[]) => {
            return x.map(x => Math.tanh(x));
        }
        this.deactivation = (x: number[]) => {
            return x.map(x => 1 - x ** 2);
        }
    }
}

export class Linear extends Layer {
    constructor(config: LayerConfig) {
        super(config);
        this.name = "Linear";
        this.activation = (x: number[]) => {
            return x;
        }
        this.deactivation = (x: number[]) => {
            return x;
        }
    }
}

export class Relu extends Layer {
    constructor(config: LayerConfig) {
        super(config);
        this.name = "Relu";
        this.activation = (x: number[]) => {
            return x.map(x => x > 0 ? x : 0);
        }
        this.deactivation = (x: number[]) => {
            return x.map(x => x > 0 ? 1 : 0);
        }
    }
}

export const LayerMap: LayerMapping = {
    "Linear": Linear,
    "Sigmoid": Sigmoid,
    "Tanh": Tanh,
    "Relu": Relu,
    "LeakyRelu": LeakyRelu,
    "DropOut": DropOut,
    "SoftMax": SoftMax,
}