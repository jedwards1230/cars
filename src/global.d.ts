/** Config for entire App */
type AppContextConfig = {
	activeAlias: string
	activeModel: string
	animFrame: number
	animTime: number
	sim: import("./car/simulator").Simulator
	activeConfig: import("./network/config").AppConfig
	simConfig: {
		trafficCount: number
		brainCount: number
		smartTraffic: boolean
	}
	trainConfig: {
		numEpisodes: number
		numSteps: number
		counter: number
	}
}

/** Config for serialized Layer  */
type LayerConfig = {
	activation: string;
	inputs: number;
	outputs: number;
	lr: number;
	id: number;
	biases?: number[];
	weights?: number[][];
}

type LayerMapping = {
	[key: string]: any
}

/** Results of training session */
type TrainInfo = {
    time: number,
    loss: number,
    speed: number,
    distance: number,
    damaged: boolean,
    model: import("./network/network").Network,
}

type Generation = {
	id: number;
	distance: number;
	score: number;
	layers?: LayerConfig[];
}

type Point = {
	x: number;
	y: number;
};

type Polygon = Point[];

type RoadBorder = Point[][];

type SensorReading = {
    x: number;
    y: number;
    offset: number;
};

type Loss = {
    loss: number,
    count: number,
}
