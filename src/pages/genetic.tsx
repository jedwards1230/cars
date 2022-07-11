import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import { Navbar } from "react-bootstrap";
import { AppContext } from "../context";
import { Simulator } from "../car/simulator";
import { SmartCar } from "../car/car";
import RoadCanvas from "../components/roadCanvas";
import GenerationEntries from "../components/generationEntries";

const Genetic = () => {
	const appContext = useContext(AppContext);

	const [stats, setStats] = useState<{
		fitness?: string
		active?: string
		carsPassed?: string
		steps?: string
		generation?: number
	}>({});

	const animate = (time: number = 0) => {
		if (appContext.sim.activeBrains === 0) {
			const bestCar = appContext.sim.getBestCar();
			const gen = getGeneration(bestCar);
			if (bestCar.carsPassed >= 2) appContext.activeConfig = bestCar.saveModelConfig(gen);
			reset();
		} else {
			appContext.sim.update();
		}
		updateStats();

		appContext.animTime = time;
		appContext.animFrame! = requestAnimationFrame(animate)
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
			fitness: bestCar.fitness.toFixed(8),
			active: appContext.sim.activeBrains.toFixed(0),
			generation: appContext.activeConfig.generations.length
		});
	}

	const reset = () => {
		appContext.sim = new Simulator(appContext.simConfig.trafficCount, appContext.simConfig.brainCount, appContext.activeConfig, appContext.simConfig.smartTraffic);
	}

	const run = () => {
		reset();
	}

	const destroyModel = () => {
		appContext.activeConfig.destroy();
		reset();
	}

	const saveModel = () => {
		const bestCar = appContext.sim.getBestCar();
		const gen = getGeneration(bestCar);
		appContext.activeConfig = bestCar.saveModelConfig(gen);
		reset();
	}

	useEffect(() => {
		appContext.simConfig.brainCount = 1000;
		run();
		animate();
		return () => cancelAnimationFrame(appContext.animFrame);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<NavComponent run={run} saveModel={saveModel} destroyModel={destroyModel} >
				{Object.entries(stats).map(([k, v], i) => {
					return (
						<Navbar.Text
							key={i}
							id={k}
							className="px-2">{k}: {v}</Navbar.Text>
					)
				})}
			</NavComponent>
			<RoadCanvas
				sim={appContext.sim} />
			<GenerationEntries />
		</>
	)
};

export default Genetic;