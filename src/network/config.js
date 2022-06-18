import { defaultTrainBrain } from "./network";

export class ModelConfig {
    constructor(name, alias) {
        this.name = name;
        this.alias = alias;
        this.lr = 0.01;
        this.layers = [];
        this.generations = [];
    }

    /** Save config to localStorage */
    save() {
        const data = JSON.stringify(this);
        localStorage.setItem(this.name, data);
    }

    destroy() {
        localStorage.removeItem(this.name);
    }

    /** Load config from localStorage */
    load() {
        const data = localStorage.getItem(this.name);
        let config = null;
        if (data) {
            config = JSON.parse(data);
        } else if (this.name === "trainBrain") {
            console.log("loading defaultTrainBrain")
            config = defaultTrainBrain;
        }
        if (!config) return;

        this.name = config.name;
        this.alias = config.alias;
        this.lr = config.lr;
        this.layers = config.layers;
        this.generations = config.generations;
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