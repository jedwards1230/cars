import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import VisualView from "../components/visualView";
import { AppContext } from "../App";
import { Simulator } from "../car/simulator";

const Home = () => {
    const appContext = useContext(AppContext);
    const sim = appContext.sim!;
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
        setStats(newStats);

        animTime.current = time;
        animFrame!.current = requestAnimationFrame(animate)
    }

    const reset = () => {
        sim.current = new Simulator(simConfig.trafficCount.current, simConfig.brainCount.current, simConfig.smartTraffic.current)
    }

    useEffect(() => {
        animate();
        return () => cancelAnimationFrame(animFrame!.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buttons: JSX.Element[] = [];

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

export default Home;