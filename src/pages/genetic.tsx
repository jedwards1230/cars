import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import VisualView from "../components/visualView";
import { Button } from "react-bootstrap";
import { AppContext } from "../App";
import { Simulator } from "../car/simulator";

const Genetic = () => {
	const appContext = useContext(AppContext);
	const sim = appContext.sim!;
	const activeConfig = appContext.activeConfig!;
    const simConfig = appContext.simConfig!;
    const animFrame = appContext.animFrame!;
	const animTime = appContext.animTime!;

    const [stats, setStats] = useState<string[][]>([]);

	const animate = (time: number = 0) => {
        sim.current.update();

		const bestCar = sim.current.getBestCar();
		const newStats = [];
		newStats.push(["speed", bestCar.speed.toFixed(1)]);
		newStats.push(["distance", bestCar.distance.toFixed(0)]);
		newStats.push(["activeBrains", sim.current.activeBrains.toFixed(0)]);
		setStats(newStats);

        animTime.current = time;
        animFrame!.current = requestAnimationFrame(animate)
    }

	const reset = () => {
        sim.current = new Simulator(simConfig.trafficCount.current, simConfig.brainCount.current, simConfig.smartTraffic.current)
    }

	const destroyModel = () => {
		activeConfig.current.destroy();
		reset();
	}

	const saveModel = () => {
		const bestCar = sim.current.getBestCar();
		bestCar.saveModelConfig();
		//reset();
	}

	const buttons = [
		<Button
			key={"saveBtn"}
			id="saveBtn"
			onClick={saveModel}
			title={"Save Model"}
			variant="outline-warning">💾</Button>,
		<Button
			key={"destroyBtn"}
			id="destroyBtn"
			onClick={destroyModel}
			title={"Destroy Model"}
			variant="outline-danger">🗑️</Button>
	]

    useEffect(() => {
        animate();
		return () => cancelAnimationFrame(animFrame!.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

	return (
		<>
			<NavComponent
				reset={reset}
				stats={stats}
				buttons={buttons} />
			<VisualView
				sim={sim.current} />
		</>
	)
};

export default Genetic;