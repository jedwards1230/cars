import React, { useEffect, useState } from "react";
import WelcomeView from "./welcome";
import TrainConfigForm from "./trainConfigForm";
import TrainProgress from "./trainProgress";
import MetricsTable from "./metrics";
import LossChart from "./lossChart";

const BodyComponent = props => {
    const [showStats, setShowStats] = useState(props.model.modelConfig.generations > 0);

    useEffect(() => {
        setShowStats(props.model.modelConfig.generations.length > 0);
    }, [props.model.modelConfig.generations]);

    if (props.welcomed && !props.showVisualizer) {
        return (
            <div id="mainView">
                <TrainConfigForm
                    beginTrain={props.beginTrain}
                    modelConfig={props.model.modelConfig} />
                {showStats &&
                    <div id="trainStats" className=" py-2 my-2">
                        <h5 className="p-3 text-center">Training Stats</h5>
                        <MetricsTable
                            episodes={props.model.modelConfig.generations} />
                        <TrainProgress
                            episodes={props.model.modelConfig.generations} />
                        <LossChart
                            episodes={props.model.modelConfig.generations} />
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