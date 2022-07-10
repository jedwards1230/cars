type AppContextConfig = {
	activeAlias?: MutableRefObject<string>;
	activeModel?: MutableRefObject<string>;
	animFrame?: MutableRefObject<number>
	animTime?: MutableRefObject<number>
	sim?: MutableRefObject<Simulator>
	activeConfig?: MutableRefObject<AppConfig>
	simConfig?: {
		trafficCount: MutableRefObject<number>
		brainCount: MutableRefObject<number>
		smartTraffic: MutableRefObject<boolean>
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