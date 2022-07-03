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
	numBrains: number;

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
		this.numBrains = 0;
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
	mutationRate: 0.1,
	sensorCount: 5,
	actionCount: 4,
	layers: [
		{
			id: 0,
			activation: "Tanh",
			inputs: 5,
			outputs: 8,
			weights: [
				[
					-0.7950787842731915,
					0.6275914490202199,
					-0.4218205209486272,
					0.4058699995762649,
					0.7067211005194132,
					0.549793407182047,
					-0.6665226905420907,
					-0.8379786086237475
				],
				[
					-0.17997495187972534,
					0.18026373847292643,
					-0.19018945818303346,
					-0.1647006027694493,
					-0.5597755414581682,
					0.3043684850270534,
					-0.1529932145269144,
					-0.3564568527480332
				],
				[
					0.6904299020141886,
					0.6881368925497418,
					-0.0490895567793137,
					-0.05521014956594916,
					-0.7292832992992304,
					0.5526753933744981,
					-0.9962010640710939,
					-0.9991729791761359
				],
				[
					-0.6170868413603605,
					0.31243147598269516,
					0.12803197523175047,
					0.3491984858848407,
					0.8939237135850089,
					-0.4110147750564037,
					-0.5980201861983945,
					-0.6075872684108723
				],
				[
					-0.02981603389895593,
					-0.09332842184222967,
					-0.14162173309707837,
					-0.3771034866455114,
					-0.7309341429915257,
					0.34730166359630843,
					0.5484715180381019,
					0.5974728225045465
				]
			],
			biases: [ 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1 ],
		},
		{
			id: 1,
			activation: "LeakyRelu",
			inputs: 8,
			outputs: 5,
			weights: [
				[
					-0.5377299325554836,
					0.5888443552446025,
					0.21017656715234168,
					0.21274204041165135,
					-0.49291461594070496
				],
				[
					0.7039307142335005,
					-0.13055124805720553,
					-0.4603407529515202,
					-0.6841959932725659,
					-0.931982184021058
				],
				[
					-0.1392785767511069,
					0.8460794788141763,
					0.847521169211523,
					0.6292230642780834,
					0.051554138221920454
				],
				[
					-0.6785405881580999,
					0.46835400565610197,
					0.8705602863060364,
					-0.7866715641432589,
					0.30191405352424017
				],
				[
					0.021676360794381733,
					0.07046024259604966,
					-0.04230584079368782,
					-0.4246125871164126,
					0.36609950469464714
				],
				[
					0.2561400604438875,
					0.1419924760471596,
					0.7524401719349676,
					-0.9844461794758468,
					0.9503026232766225
				],
				[
					-0.0012797047083412671,
					0.8676675348339811,
					-0.7297256716929765,
					-0.37157377795756075,
					-0.9453629366235274
				],
				[
					0.9258696139325453,
					-0.8869440574040892,
					0.6759925321563371,
					0.5556271373092132,
					0.04656018729113054
				]
			],
			biases: [ 0.1, 0.1, 0.1, 0.1, 0.1 ],
		},
		{
			id: 2,
			activation: "Sigmoid",
			inputs: 5,
			outputs: 4,
			weights: [
				[
					0.6947926525233958,
					0.9305557403968967,
					-0.7828442564011513,
					-0.370727602056943
				],
				[
					0.004887532327290778,
					-0.8093865436468763,
					0.022285008906043124,
					0.9932521335962017
				],
				[
					0.9619129960450321,
					0.5033971707535785,
					0.36934699510482183,
					-0.8862527891510319
				],
				[
					-0.7966797986893757,
					0.4058620105293289,
					0.6097787394838026,
					0.12159274744801474
				],
				[
					0.4149227035283638,
					0.7639255181571345,
					-0.14632315042759858,
					0.215001127713232
				]
			],
			biases: [ 0.1, 0.1, 0.1, 0.1 ],
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
