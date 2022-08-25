import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../src/components/navbar/navbar";
import { AppContext } from "../src/context";
import { Simulator } from "../src/car/simulator";
import RoadCanvas from "../src/components/roadCanvas";
import NetworkCanvas from "../src/components/networkCanvas";

export default function Home() {
	const appContext = useContext(AppContext);

	const [stats, setStats] = useState<NavMetrics>({});

	const animate = (time: number = 0) => {
		if (appContext.sim.activeBrains === 0) {
			reset();
		} else {
			appContext.sim.update();
		}
		updateStats();

		appContext.animTime = time;
		appContext.animFrame = requestAnimationFrame(animate)
	}

	const updateStats = () => {
		const bestCar = appContext.sim.getBestCar();
		setStats({
			speed: bestCar.speed.toFixed(1),
			distance: bestCar.distance.toFixed(0)
		});
	}

	const reset = () => {
		appContext.sim = new Simulator(appContext.simConfig.trafficCount, appContext.simConfig.brainCount, appContext.activeConfig, appContext.simConfig.smartTraffic)
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
			<NavComponent run={reset} metrics={stats} />
			<RoadCanvas
				sim={appContext.sim} />
			<NetworkCanvas
				network={appContext.sim.getBestCar().brain} />
		</>
	)
}
