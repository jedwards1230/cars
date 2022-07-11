export class AppConfig {
	name: string;
	alias: string;
	lr: number;
	layers: LayerConfig[];
	generations: Generation[];
	epsilonDecay: number;
	mutationAmount: number;
	mutationRate: number;
	sensorCount: number;
	actionCount: number;

	constructor(name: string, alias: string) {
		this.name = name;
		this.alias = alias;
		this.lr = 0.01;
		this.generations = [];
		this.epsilonDecay = 0.99;
		this.mutationAmount = 0.01;
		this.mutationRate = 0.01;
		this.sensorCount = 7;
		this.actionCount = 4;
		this.layers = [
			{
				id: 0,
				activation: "Tanh",
				inputs: 10,
				outputs: 15,
				lr: 0.01,
				biases: null,
				weights: null,
			},
			{
				id: 1,
				activation: "Tanh",
				inputs: 15,
				outputs: 10,
				lr: 0.01,
				biases: null,
				weights: null,
			},
			{
				id: 2,
				activation: "Sigmoid",
				inputs: 10,
				outputs: 4,
				lr: 0.01,
				biases: null,
				weights: null,
			},
		];

		this.load();
	}

	/** Save config to localStorage */
	save() {
		const data = JSON.stringify(this, null, "\t");
		localStorage.setItem(this.name, data);
	}

	clear() {
		this.generations = [];
		this.#clearWeights();
	}

	destroy() {
		this.generations = [];
		this.#clearWeights();
		//localStorage.removeItem(this.name);
	}

	/** Load config from localStorage */
	load() {
		// Check localStorage
		const data = localStorage.getItem(this.name);
		if (!data) return;
		const config = JSON.parse(data)

		this.name = config.name;
		this.alias = config.alias;
		this.lr = config.lr;
		this.epsilonDecay = config.epsilonDecay;
		this.mutationAmount = config.mutationAmount;
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

	#clearWeights() {
		this.layers.forEach((layer) => {
			layer.biases = null;
			layer.weights = null;
		});
		this.save();
	}
}