import React, { createContext, MutableRefObject, useRef } from "react";
import { AppConfig } from "./network/config";
import { Simulator } from "./car/simulator";
import {
	BrowserRouter,
	Routes,
	Route,
} from "react-router-dom";
import Home from "./pages/home";
import Genetic from "./pages/genetic";
import Teach from "./pages/teach";

export type AppContextConfig = {
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

export const AppContext = createContext<AppContextConfig>({});

const App = () => {
	const trafficCount = useRef(50);
	const brainCount = useRef(400);
	const smartTraffic = useRef(false);

	const activeAlias = useRef<string>("fsd");
	const activeModel = useRef<string>("trainBrain");

	const sim = useRef<Simulator>(new Simulator(trafficCount.current, brainCount.current, smartTraffic.current));

	const defaultValues = {
		sim: sim,
		activeAlias: activeAlias,
		activeModel: activeModel,
		activeConfig: useRef<AppConfig>(new AppConfig(activeModel.current, activeAlias.current)),
		animFrame: useRef<number>(0),
		animTime: useRef<number>(0),
		simConfig: {
			trafficCount: trafficCount,
			brainCount: brainCount,
			smartTraffic: smartTraffic
		},
	}

	return (
		<AppContext.Provider value={defaultValues} >
			<BrowserRouter>
				<Routes>
					<Route path="/cars/" element={<Home />} />
					<Route path="/cars/genetic" element={<Genetic />} />
					<Route path="/cars/teach" element={<Teach />} />
				</Routes>
			</BrowserRouter>
		</AppContext.Provider >

	)
};

export default App;