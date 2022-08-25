import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../src/components/navbar/navbar";
import { AppContext } from "../src/context";
import { Simulator } from "../src/car/simulator";
import { SmartCar } from "../src/car/car";
import RoadCanvas from "../src/components/roadCanvas";
import GenerationEntries from "../src/components/generationEntries";
import NetworkCanvas from "../src/components/networkCanvas";

const Genetic = () => {
	const appContext = useContext(AppContext);

	const [stats, setStats] = useState<NavMetrics>({});

	const animate = (time: number = 0) => {
		if (appContext.sim.activeBrains < 1) {
			const bestCar = appContext.sim.getBestCar();
			//const gen = getGeneration(bestCar);
			if (bestCar.distance > 500) {
				//appContext.activeConfig = bestCar.saveModelConfig(appContext.activeConfig, gen);
			}
			reset();
			console.log(appContext.activeConfig);
		} else {
			appContext.sim.update();
		}
		updateStats();

		appContext.animTime = time;
		appContext.animFrame = requestAnimationFrame(animate)
	}

	const getGeneration = (car: SmartCar): Generation => {
		return {
			id: appContext.activeConfig.generations.length,
			distance: Math.round(car.distance),
			score: car.carsPassed,
		}
	}

	const updateStats = () => {
		const bestCar = appContext.sim.getBestCar();
		setStats({
			active: appContext.sim.activeBrains,
			carsPassed: bestCar.carsPassed,
			steps: bestCar.steps,
		});
	}

	const reset = () => {
		appContext.sim = new Simulator(appContext.simConfig.trafficCount, appContext.simConfig.brainCount, appContext.activeConfig, appContext.simConfig.smartTraffic);
	}

	const run = () => {
		reset();
	}

	const destroyModel = () => {
		//appContext.activeConfig.destroy();
		reset();
	}

	const saveModel = () => {
		const bestCar = appContext.sim.getBestCar();
		const gen = getGeneration(bestCar);
		appContext.activeConfig = bestCar.saveModelConfig(appContext.activeConfig, gen);
		reset();
	}

	useEffect(() => {
		appContext.simConfig.brainCount = 300;
		run();
		animate();
		return () => cancelAnimationFrame(appContext.animFrame);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<NavComponent run={reset} saveModel={saveModel} destroyModel={destroyModel} metrics={stats} />
			<RoadCanvas sim={appContext.sim} />
			<NetworkCanvas network={appContext.sim.getBestCar().brain} />
			<GenerationEntries />
		</>
	)
};

export default Genetic;