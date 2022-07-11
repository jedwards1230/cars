import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import { Teacher } from "../car/simulator";
import { Navbar } from "react-bootstrap";
import { AppContext } from "../context";
import NetworkCanvas from "../components/networkCanvas";
import RoadCanvas from "../components/roadCanvas";

const Teach = (props: any) => {
	const appContext = useContext(AppContext);

	const [stats, setStats] = useState<{
		speed?: number | string
		distance?: number | string
		loss?: number | string
	}>({});

	const animate = (time: number = 0) => {
		appContext.sim.update();
		updateStats();

		appContext.animTime = time;
		appContext.animFrame! = requestAnimationFrame(animate)
	}

	const updateStats = () => {
		const sim = appContext.sim as Teacher;
		const bestCar = sim.getBestCar();
		const loss = sim.getLoss();

		setStats({
			speed: bestCar.speed.toFixed(1),
			distance: bestCar.distance.toFixed(0),
			loss: loss.toFixed(4)
		});
	}

	const reset = () => {
		appContext.sim = new Teacher(appContext.simConfig.trafficCount, appContext.activeConfig, appContext.simConfig.smartTraffic)
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
		bestCar.saveModelConfig(appContext.activeConfig);
		//reset();
	}

	useEffect(() => {
		appContext.simConfig.brainCount = 1;
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
			<NetworkCanvas
				network={appContext.sim.getBestCar().brain} />
		</>
	)
};

export default Teach;