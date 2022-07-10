import { createContext } from "react";
import { Simulator } from "./car/simulator";
import { AppConfig } from "./network/config";

const trafficCount = 50;
const brainCount = 1000;
const smartTraffic = false;

const activeAlias = "fsd";
const activeModel = "trainBrain";

const activeConfig = new AppConfig(activeModel, activeAlias)

const sim = new Simulator(trafficCount, brainCount, activeConfig, smartTraffic);

export const defaultAppContextConfig: AppContextConfig = {
	sim: sim,
	activeAlias: activeAlias,
	activeModel: activeModel,
	activeConfig: activeConfig,
	animFrame: 0,
	animTime: 0,
	simConfig: {
		trafficCount: trafficCount,
		brainCount: brainCount,
		smartTraffic: smartTraffic
	},
	trainConfig: {
		numEpisodes: 100,
		numSteps: 1000,
		counter: 0
	}
}

export const AppContext = createContext<AppContextConfig>(defaultAppContextConfig);
