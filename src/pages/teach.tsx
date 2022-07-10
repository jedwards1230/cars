import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import VisualView from "../components/visualView";
import { Simulator } from "../car/simulator";
import { Button, Navbar } from "react-bootstrap";
import { AppContext } from "../context";

const Teach = (props: any) => {
	const appContext = useContext(AppContext);
	const activeConfig = appContext.activeConfig;
	const simConfig = appContext.simConfig!;

	const [stats, setStats] = useState<{
		key: string,
		value: string
	}[]>([]);

	const animate = (time: number = 0) => {
		appContext.sim.update();

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
			key: "loss",
			value: `${loss.toFixed(4)}`
		})
		setStats(newStats);

		appContext.animTime = time;
		appContext.animFrame! = requestAnimationFrame(animate)
	}

	const reset = () => {
		appContext.sim = new Simulator(simConfig.trafficCount, simConfig.brainCount, simConfig.smartTraffic, true)
	}

	const run = () => {
		reset();
	}

	const destroyModel = () => {
		activeConfig.destroy();
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
			<NavComponent run={run} >
				{stats.map((stat, i) => {
					return (
						<Navbar.Text
							key={i}
							id={stat.key}
							className="px-2">{stat.key} = {stat.value}</Navbar.Text>
					)
				})}
				{/* //todo: better way to send buttons to navbar */}
				<Button
					key={"saveBtn"}
					id="saveBtn"
					onClick={saveModel}
					title={"Save Model"}
					variant="outline-warning">💾</Button>
				<Button
					key={"destroyBtn"}
					id="destroyBtn"
					onClick={destroyModel}
					title={"Destroy Model"}
					variant="outline-danger">🗑️</Button>
			</NavComponent>
			<VisualView
				sim={appContext.sim} />
		</>
	)
};

export default Teach;