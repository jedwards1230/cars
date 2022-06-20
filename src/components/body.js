import React, { useEffect, useState } from "react";
import WelcomeView from "./welcome";
import TrainConfigForm from "./trainConfigForm";
// eslint-disable-next-line no-unused-vars
import TrainProgress from "./trainProgress";
import MetricsTable from "./metrics";
import LossChart from "./lossChart";

const BodyComponent = props => {
    const [showStats, setShowStats] = useState(props.generations > 0);

    useEffect(() => {
        setShowStats((props.generations.length > 0));
    }, [props.generations]);

    if (props.welcomed && !props.showVisualizer) {
        return (
            <div id="mainView">
                <TrainConfigForm
                    beginTrain={props.beginTrain}
                    modelConfig={props.modelConfig}
                    episodeCounter={props.episodeCounter} />
                {showStats &&
                    <div id="trainStats" className=" py-2 my-2">
                        <h5 className="p-3 text-center">Training Stats</h5>
                        <MetricsTable
                            episodes={props.generations} />
                        <LossChart
                            episodes={props.generations} />
                    </div>}
            </div>
        )
    } else if (!props.welcomed) {
        return (
            <div id="mainView">
                <WelcomeView
                    setPlay={props.setPlay}
                    setTrain={props.setTrain}
                    setWelcomed={props.setWelcomed} />
            </div>
        )
    }

}

export default BodyComponent;