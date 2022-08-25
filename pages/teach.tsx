import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../src/components/navbar/navbar";
import { Teacher } from "../src/car/simulator";
import { AppContext } from "../src/context";
import NetworkCanvas from "../src/components/networkCanvas";
import RoadCanvas from "../src/components/roadCanvas";

const Teach = (props: any) => {
    const appContext = useContext(AppContext);

    const [stats, setStats] = useState<NavMetrics>({});

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
        //appContext.activeConfig.destroy();
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
            <NavComponent run={reset} metrics={stats} />
            <RoadCanvas
                sim={appContext.sim} />
            <NetworkCanvas
                network={appContext.sim.getBestCar().brain} />
        </>
    )
};

export default Teach;