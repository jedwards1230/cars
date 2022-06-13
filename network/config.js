export class ModelConfig {
    constructor(inputCount, outputCount, layers = [], lr = 0.001) {
        this.layers = [];
        this.epsilon = 0.4;
        this.confidence = 0.5;
    }
}