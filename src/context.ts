import { createContext } from "react";
import { Simulator } from "./car/simulator";
import { AppConfig } from "./network/config";

const trafficCount = 50;
const brainCount = 400;
const smartTraffic = false;

const activeAlias = "fsd";
const activeModel = "trainBrain";

const sim = new Simulator(trafficCount, brainCount, smartTraffic);

export const defaultAppContextConfig: AppContextConfig = {
	sim: sim,
	activeAlias: activeAlias,
	activeModel: activeModel,
	activeConfig: new AppConfig(activeModel, activeAlias),
	animFrame: 0,
	animTime: 0,
	simConfig: {
		trafficCount: trafficCount,
		brainCount: brainCount,
		smartTraffic: smartTraffic
	},
}

export const AppContext = createContext<AppContextConfig>(defaultAppContextConfig);
