export class ModelConfig {
	name: string;
	alias: string;
	lr: number;
	layers: LayerConfig[];
	generations: any[];
	epsilonDecay: number;
	mutationRate: number;
	sensorCount: number;
	actionCount: number;
	numEpisodes: number;
	numSteps: number;

	constructor(name: string, alias: string) {
		this.name = name;
		this.alias = alias;
		this.lr = 0.01;
		this.layers = [];
		this.generations = [];
		this.epsilonDecay = 0.99;
		this.mutationRate = 0.1;
		this.sensorCount = 0;
		this.actionCount = 0;
		this.numEpisodes = 0;
		this.numSteps = 0;
	}

	/** Save config to localStorage */
	save() {
		const data = JSON.stringify(this, null, "\t");
		localStorage.setItem(this.name, data);
	}

	destroy() {
		this.generations = [];
		localStorage.removeItem(this.name);
	}

	/** Load config from localStorage */
	load() {
		// Check localStorage
		const data = localStorage.getItem(this.name);
		let config = null;
		// Load default if none found
		if (data) {
			config = JSON.parse(data);
		} else if (this.name === "trainBrain") {
			console.log("loading defaultForwardBrain");
			config = defaultForwardBrain;
		}
		if (!config) return;

		this.name = config.name;
		this.alias = config.alias;
		this.lr = config.lr;
		this.epsilonDecay = config.epsilonDecay;
		this.mutationRate = config.mutationRate;
		this.sensorCount = config.sensorCount;
		this.actionCount = config.actionCount;
		this.layers = config.layers;
		this.generations = config.generations;
		this.save();
	}

	/** Compare configs to see if layers are compatible (by activation, input, and output count) */
	compare(config: ModelConfig) {
		if (!config || !config.layers) return false;
		if (this.layers.length !== config.layers.length) return false;
		for (let i = 0; i < this.layers.length; i++) {
			if (this.layers[i].activation !== config.layers[i].activation)
				return false;
			if (this.layers[i].inputs !== config.layers[i].inputs) return false;
			if (this.layers[i].outputs !== config.layers[i].outputs) return false;
		}
		return true;
	}
}

export type LayerConfig = {
	activation: string;
	inputs: number;
	outputs: number;
	lr: number;
	id: number;
	biases: number[];
	weights: number[][];
}

const defaultTrainBrain = {
	name: "trainBrain",
	alias: "fsd",
	lr: 0.001,
	epsilonDecay: 0.9,
	mutationRate: 0.05,
	sensorCount: 5,
	actionCount: 4,
	layers: [
		{
			id: 0,
			activation: "Tanh",
			inputs: 5,
			outputs: 8,
		},
		{
			id: 1,
			activation: "LeakyRelu",
			inputs: 8,
			outputs: 5,
		},
		{
			id: 2,
			activation: "Sigmoid",
			inputs: 5,
			outputs: 4,
		},
	],
	generations: [],
};

const defaultForwardBrain = {
	name: "trafficForward",
	alias: "forward",
	lr: 0.001,
	epsilonDecay: 0.99,
	mutationRate: 0.05,
	sensorCount: 3,
	actionCount: 2,
	layers: [
		{
			id: 0,
			activation: "Tanh",
			inputs: 3,
			outputs: 3,
			weights: [
				[0.16301358590881249, 0.06655747653191099, -0.002821014820185678],
				[0.0015701754260134817, 0.2973476526946789, 0.03780176776836455],
				[-0.18999580034831548, 0.24332761155702254, -0.056238421904291395],
			],
			biases: [-0.9099945191213984, 0.5746715078863484, 0.10933239518212397],
		},
		{
			id: 1,
			activation: "Sigmoid",
			inputs: 3,
			outputs: 2,
			weights: [
				[0.05879472462854643, -0.26671087907051877],
				[0.12702500460514837, 0.35342704088524063],
				[-0.1269635260491831, -0.23965514383302527],
			],
			biases: [3.8110326859515516, 3.2316354488463214],
		},
	],
	generations: [],
};

const trainBrain = localStorage.getItem("trainBrain");
if (!trainBrain) {
	const trainData = JSON.stringify(defaultTrainBrain, null, "\t");
	localStorage.setItem("trainBrain", trainData);
}
const forwardBrain = localStorage.getItem("forwardBrain");
if (!forwardBrain) {
	const forwardData = JSON.stringify(defaultForwardBrain, null, "\t");
	localStorage.setItem("trafficForward", forwardData);
}
