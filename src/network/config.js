import { defaultTrainBrain } from "./network";

export class ModelConfig {
    constructor() {
        this.name = "";
        this.alias = "";
        this.lr = 0.01;
        this.layers = [];
    }

    /** Save config to localStorage */
    save() {
        const data = JSON.stringify(this);
        localStorage.setItem(this.name, data);
    }

    /** Load config from localStorage */
    load(name) {
        const data = localStorage.getItem(name);
        if (data) {
            const config = JSON.parse(data);
            this.name = config.name;
            this.alias = config.alias;
            this.lr = config.lr;
            this.layers = config.layers;
        } else if (name === "trainBrain") {
            const config = defaultTrainBrain;
            this.name = config.name;
            this.alias = config.alias;
            this.lr = config.lr;
            this.layers = config.layers;
        }
    }

    /** Compare configs to see if layers are compatible (by activation, input, and output count) */
    compare(config) {
        if (!config || !config.layers) return false;
        if (this.layers.length !== config.layers.length) return false;
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].activation !== config.layers[i].activation) return false;
            if (this.layers[i].inputs !== config.layers[i].inputs) return false;
            if (this.layers[i].outputs !== config.layers[i].outputs) return false;
        }
        return true;
    }
}

/* {
    "name": "forwardBrain",
    "alias": "forward",
    "lr": 0.001,
    "layers": [
        {
            "activation": "Tanh",
            "inputs": 4,
            "outputs": 3,
            "weights": [
                [-0.054578436663617134, 0.37513033769486365, -0.10983221545303008],
                [0.16301358590881249, 0.06655747653191099, -0.002821014820185678],
                [0.0015701754260134817, 0.2973476526946789, 0.03780176776836455],
                [-0.18999580034831548, 0.24332761155702254, -0.056238421904291395]
            ],
            "biases": [-0.9099945191213984, 0.5746715078863484, 0.10933239518212397]
        }, {
            "activation": "Sigmoid",
            "inputs": 3,
            "outputs": 2,
            "weights": [
                [0.05879472462854643, -0.26671087907051877],
                [0.12702500460514837, 0.35342704088524063],
                [-0.1269635260491831, -0.23965514383302527]
            ],
            "biases": [3.9110326859515516, 3.2316354488463214]
        }
    ]
} */