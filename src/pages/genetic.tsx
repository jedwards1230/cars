import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import VisualView from "../components/visualView";
import { Navbar } from "react-bootstrap";
import { AppContext } from "../context";
import { Simulator } from "../car/simulator";

const Genetic = () => {
	const appContext = useContext(AppContext);

	const [stats, setStats] = useState<{
		fitness?: string,
		active?: string
		carsPassed?: string
		steps?: string
	}>({});

	const animate = (time: number = 0) => {
		appContext.sim.update();
		updateStats();

		appContext.animTime = time;
		appContext.animFrame! = requestAnimationFrame(animate)
	}

	const updateStats = () => {
		const bestCar = appContext.sim.getBestCar();
		setStats({
			fitness: bestCar.fitness.toFixed(8),
			active: appContext.sim.activeBrains.toFixed(0),
			carsPassed: bestCar.carsPassed.toFixed(0),
			steps: bestCar.steps.toFixed(0)
		});
	}

	const reset = () => {
		appContext.sim = new Simulator(appContext.simConfig.trafficCount, appContext.simConfig.brainCount, appContext.activeConfig, appContext.simConfig.smartTraffic)
	}

	const destroyModel = () => {
		appContext.activeConfig.destroy();
		reset();
	}

	const saveModel = () => {
		const bestCar = appContext.sim.getBestCar();
		bestCar.saveModelConfig();
	}

	useEffect(() => {
		animate();
		return () => cancelAnimationFrame(appContext.animFrame);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<NavComponent run={reset} saveModel={saveModel} destroyModel={destroyModel} >
				{Object.entries(stats).map(([k, v], i) => {
					return (
						<Navbar.Text
							key={i}
							id={k}
							className="px-2">{k}: {v}</Navbar.Text>
					)
				})}
			</NavComponent>
			<VisualView
				sim={appContext.sim} />
		</>
	)
};

export default Genetic;