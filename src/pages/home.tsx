import React, { useContext, useEffect, useState } from "react";
import NavComponent from "../components/navbar";
import VisualView from "../components/visualView";
import { AppContext } from "../context";
import { Simulator } from "../car/simulator";
import { Navbar } from "react-bootstrap";

const Home = () => {
    const appContext = useContext(AppContext);
    const simConfig = appContext.simConfig!;

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
        setStats(newStats);

        appContext.animTime = time;
        appContext.animFrame = requestAnimationFrame(animate)
    }

    const reset = () => {
        appContext.sim = new Simulator(simConfig.trafficCount, simConfig.brainCount, simConfig.smartTraffic)
    }

    useEffect(() => {
        animate();
        return () => cancelAnimationFrame(appContext.animFrame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <NavComponent run={reset} >
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

export default Home;