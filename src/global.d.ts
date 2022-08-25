/** Config for entire App */
type AppContextConfig = {
	activeAlias: string
	activeModel: string
	animFrame: number
	animTime: number
	sim: import("./car/simulator").Teacher | import("./car/simulator").Simulator
	activeConfig: import("@jedwards1230/nn.js").AppConfig
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

type Generation = {
	id: number;
	distance: number;
	score: number;
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

type NavMetrics = {
	speed?: number | string;
	distance?: number | string;
	active?: number | string;
	bestID?: number | string;
	carsPassed?: number | string;
	steps?: number | string;
	loss?: number | string;
}

type Loss = {
    loss: number,
    count: number,
}
