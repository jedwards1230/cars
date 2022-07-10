export class AppConfig {
	name: string;
	alias: string;
	lr: number;
	layers: LayerConfig[];
	generations: TrainInfo[];
	epsilonDecay: number;
	mutationRate: number;
	sensorCount: number;
	actionCount: number;
	smartCarCount: number;
	trafficCount: number;

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
		this.smartCarCount = 1;
		this.trafficCount = 30;

		this.load();
	}

	/** Save config to localStorage */
	save() {
		const data = JSON.stringify(this, null, "\t");
		localStorage.setItem(this.name, data);
	}

	clearWeights() {
		this.layers.forEach((layer) => {
			layer.biases = [];
			layer.weights = new Array(layer.inputs);
			for (let i = 0; i < layer.inputs; i++) {
				layer.weights[i] = new Array(layer.outputs);
				for (let j = 0; j < layer.outputs; j++) {
					layer.weights[i][j] = 0;
				}
			}
		});
		this.save();
	}

	destroy() {
		this.generations = [];
		this.clearWeights();
		//localStorage.removeItem(this.name);
	}

	/** Load config from localStorage */
	load() {
		// Check localStorage
		const data = localStorage.getItem(this.name);
		const config = data ? JSON.parse(data) : defaultTrainBrain;

		this.smartCarCount = config.smartCarCount;
		this.trafficCount = config.trafficCount;
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
	compare(config: AppConfig) {
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

const defaultTrainBrain = {
	name: "trainBrain",
	alias: "fsd",
	lr: 0.01,
	epsilonDecay: 0.9,
	mutationRate: 0.1,
	sensorCount: 7,
	actionCount: 4,
	layers: [
		{
			id: 0,
			activation: "Relu",
			inputs: 10,
			outputs: 15,
		},
		{
			id: 1,
			activation: "Relu",
			inputs: 15,
			outputs: 10,
		},
		{
			id: 2,
			activation: "Sigmoid",
			inputs: 10,
			outputs: 4,
		},
	],
	generations: [],
};
