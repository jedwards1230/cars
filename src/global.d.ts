type AppContextConfig = {
	activeAlias: string
	activeModel: string
	animFrame: number
	animTime: number
	sim: Simulator
	activeConfig: AppConfig
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

type LayerConfig = {
	activation: string;
	inputs: number;
	outputs: number;
	lr: number;
	id: number;
	biases?: number[];
	weights?: number[][];
}

type TrainInfo = {
    time: number,
    loss: number,
    speed: number,
    distance: number,
    damaged: boolean,
    model: Network,
}

type Point = {
	x: number;
	y: number;
};

type SensorReading = {
    x: number;
    y: number;
    offset: number;
};

type Loss = {
    loss: number,
    count: number,
}