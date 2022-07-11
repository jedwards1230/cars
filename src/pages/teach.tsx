import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import { Simulator } from "../car/simulator";
import { Navbar } from "react-bootstrap";
import { AppContext } from "../context";
import NetworkCanvas from "../components/networkCanvas";
import RoadCanvas from "../components/roadCanvas";

const Teach = (props: any) => {
	const appContext = useContext(AppContext);

	const [stats, setStats] = useState<{
		speed?: string,
		distance?: string
		steps?: string
		angle?: string
		loss?: string
	}>({});

	const animate = (time: number = 0) => {
		appContext.sim.update();
		updateStats();

		appContext.animTime = time;
		appContext.animFrame! = requestAnimationFrame(animate)
	}

	const updateStats = () => {
		const bestCar = appContext.sim.getBestCar();
		const loss = appContext.sim.getLoss();

		setStats({
			speed: bestCar.fitness.toFixed(8),
			distance: appContext.sim.activeBrains.toFixed(0),
			steps: (bestCar.distance / bestCar.steps).toFixed(0),
			angle: bestCar.angle.toFixed(2),
			loss: loss.toFixed(4)
		});
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
		appContext.simConfig.brainCount = 1;
		reset();
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
			<NetworkCanvas
				network={appContext.sim.getBestCar().brain} />
		</>
	)
};

export default Teach;