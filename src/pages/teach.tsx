import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import VisualView from "../components/visualView";
import { Simulator } from "../car/simulator";
import { Navbar } from "react-bootstrap";
import { AppContext } from "../context";

const Teach = (props: any) => {
	const appContext = useContext(AppContext);

	const [stats, setStats] = useState<{
		key: string,
		value: string
	}[]>([]);

	const animate = (time: number = 0) => {
		appContext.sim.update();
		updateStats();

		appContext.animTime = time;
		appContext.animFrame! = requestAnimationFrame(animate)
	}

	const updateStats = () => {
		const bestCar = appContext.sim.getBestCar();
		const newStats = [];
		const loss = appContext.sim.getLoss();
		newStats.push({
			key: "speed",
			value: `${bestCar.speed.toFixed(1)}`
		});
		newStats.push({
			key: "distance",
			value: `${bestCar.distance.toFixed(0)}`
		});
		newStats.push({
			key: "steps",
			value: `${(bestCar.distance / bestCar.steps).toFixed(0)}`
		})
		newStats.push({
			key: "angle",
			value: `${bestCar.angle.toFixed(2)}`
		})
		newStats.push({
			key: "loss",
			value: `${loss.toFixed(4)}`
		})
		setStats(newStats);
	}

	const reset = () => {
		appContext.sim = new Simulator(appContext.simConfig.trafficCount, appContext.simConfig.brainCount, appContext.activeConfig, appContext.simConfig.smartTraffic, true)
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
			<NavComponent run={run} saveModel={saveModel} destroyModel={destroyModel} >
				{stats.map((stat, i) => {
					return (
						<Navbar.Text
							key={i}
							id={stat.key}
							className="px-2">{stat.key} = {stat.value}</Navbar.Text>
					)
				})}
				{/* //todo: better way to send buttons to navbar */}
			</NavComponent>
			<VisualView
				sim={appContext.sim} />
		</>
	)
};

export default Teach;