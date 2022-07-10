import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import VisualView from "../components/visualView";
import { AppContext } from "../context";
import { Simulator } from "../car/simulator";
import { Navbar } from "react-bootstrap";

const Home = () => {
    const appContext = useContext(AppContext);

    const [stats, setStats] = useState<{
        speed?: string,
        distance?: string
    }>({});

    const animate = (time: number = 0) => {
        appContext.sim.update();
        updateStats();

        appContext.animTime = time;
        appContext.animFrame = requestAnimationFrame(animate)
    }

    const updateStats = () => {
        const bestCar = appContext.sim.getBestCar();
        setStats({
            speed: bestCar.fitness.toFixed(8),
            distance: appContext.sim.activeBrains.toFixed(0)
        });
    }

    const reset = () => {
        appContext.sim = new Simulator(appContext.simConfig.trafficCount, appContext.simConfig.brainCount, appContext.activeConfig, appContext.simConfig.smartTraffic)
    }

    useEffect(() => {
        animate();
        return () => cancelAnimationFrame(appContext.animFrame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <NavComponent run={reset} >
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

export default Home;