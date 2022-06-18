class Layer {
    constructor(inputs, outputs) {
        this.inputs = new Array(inputs);
        this.weights = new Array(inputs);
        for (let i = 0; i < inputs; i++) {
            this.weights[i] = new Array(outputs).fill(0);
        }

        this.biases = new Array(outputs).fill(0.1);
        this.outputs = new Array(outputs);

        this.#randomize();
    }

    /** Forward propagation */
    forward(inputs, backprop = false) {
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
    backward(delta) {
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

    updateWeights(gradient) {
        const m = 1 / gradient.length;
        for (let i = 0; i < gradient.length; i++) {
            for (let j = 0; j < this.outputs.length; j++) {
                this.weights[i][j] -= m * gradient[i][j] * this.lr;
            }
        }
    }

    updateBiases(gradient) {
        const m = 1 / gradient.length;
        for (let i = 0; i < this.biases.length; i++) {
            this.biases[i] -= m * gradient[i] * this.lr;
        }
    }

    save() {
        return {
            activation: this.name,
            inputs: this.inputs.length,
            outputs: this.outputs.length,
            weights: this.weights,
            biases: this.biases
        }
    }

    /** Randomize weights with (Math.random() * 2 - 1) */
    #randomize() {
        for (let i = 0; i < this.inputs.length; i++) {
            for (let j = 0; j < this.outputs.length; j++) {
                this.weights[i][j] = Math.random() * 2 - 1;
            }
        }
    }
}

export class SoftMax extends Layer {
    constructor(inputs, outputs, lr) {
        super(inputs, outputs, lr);
        this.name = "SoftMax";
        this.activation = (x) => {
            const maxLogit = Math.max(...x);
            const scores = x.map(l => Math.exp(l - maxLogit));
            const denom = scores.reduce((a, b) => a + b);
            return scores.map(s => s / denom);
        }
    }
}

export class Sigmoid extends Layer {
    constructor(inputCount, outputCount, lr) {
        super(inputCount, outputCount, lr);
        this.name = "Sigmoid";
        this.activation = x => {
            return x.map(x => 1 / (1 + Math.exp(-x)));
        }
        this.deactivation = x => {
            return x.map(x => x * (1 - x));
        }
    }
}

export class LeakyRelu extends Layer {
    constructor(inputCount, outputCount, lr, alpha = 0.01) {
        super(inputCount, outputCount, lr);
        this.name = "LeakyRelu";
        this.alpha = alpha;
        this.activation = x => {
            return x.map(x => x > 0 ? x : x * this.alpha);
        }
        this.deactivation = x => {
            return x.map(x => x > 0 ? 1 : this.alpha);
        }
    }
}

export class DropOut extends Layer {
    constructor(inputCount, outputCount, lr, dropRate = 0.5) {
        super(inputCount, outputCount, lr);
        this.name = "DropOut";
        this.dropRate = dropRate;
        this.activation = x => {
            return x.map(x => Math.random() < this.dropRate ? 0 : x);
        }
    }
}

export class Tanh extends Layer {
    constructor(inputCount, outputCount, lr) {
        super(inputCount, outputCount, lr);
        this.name = "Tanh";
        this.activation = x => {
            return x.map(x => Math.tanh(x));
        }
        this.deactivation = x => {
            return x.map(x => 1 - x ** 2);
        }
    }
}

export class Linear extends Layer {
    constructor(inputCount, outputCount, lr) {
        super(inputCount, outputCount, lr);
        this.name = "Linear";
        this.activation = x => {
            return x;
        }
        this.deactivation = x => {
            return x;
        }
    }
}

export class Relu extends Layer {
    constructor(inputCount, outputCount, lr) {
        super(inputCount, outputCount, lr);
        this.name = "Relu";
        this.activation = x => {
            return x.map(x => x > 0 ? x : 0);
        }
        this.deactivation = x => {
            return x.map(x => x > 0 ? 1 : 0);
        }
    }
}