import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import VisualView from "../components/visualView";
import { Navbar } from "react-bootstrap";
import { AppContext } from "../context";
import { Simulator } from "../car/simulator";

const Genetic = () => {
	const appContext = useContext(AppContext);

	const [stats, setStats] = useState<{
		key: string,
		value: string
	}[]>([]);

	const animate = (time: number = 0) => {
		appContext.sim.update();

		const bestCar = appContext.sim.getBestCar();
		const newStats = [];
		newStats.push({
			key: "speed",
			value: `${bestCar.speed.toFixed(1)}`
		});
		newStats.push({
			key: "distance",
			value: `${bestCar.distance.toFixed(0)}`
		});
		newStats.push({
			key: "activeBrains",
			value: `${appContext.sim.activeBrains.toFixed(0)}`
		})
		setStats(newStats);

		appContext.animTime = time;
		appContext.animFrame! = requestAnimationFrame(animate)
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
		//reset();
	}

	useEffect(() => {
		animate();
		return () => cancelAnimationFrame(appContext.animFrame);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<NavComponent run={reset} saveModel={saveModel} destroyModel={destroyModel} >
				{stats.map((stat, i) => {
					return (
						<Navbar.Text
							key={i}
							id={stat.key}
							className="px-2">{stat.key} = {stat.value}</Navbar.Text>
					)
				})}
			</NavComponent>
			<VisualView
				sim={appContext.sim} />
		</>
	)
};

export default Genetic;