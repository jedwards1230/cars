import React, { useEffect, useState } from "react";
import WelcomeView from "./welcome";
import TrainConfigForm from "./trainConfigForm";
import TrainStats from "./trainStats";
import MetricsTable from "./metrics";

const BodyComponent = props => {
    const [showStats, setShowStats] = useState(props.episodes > 0);

    useEffect(() => {
        setShowStats(props.episodes.length > 0);
    }, [props.episodes]);

    if (props.welcomed && !props.showVisualizer) {
        return (
            <div>
                <TrainConfigForm
                    beginTrain={props.beginTrain} />
                {showStats &&
                    <div id="trainStats" className="row py-2 my-2 bg-light">
                        <MetricsTable
                            episodes={props.episodes} />
                        <TrainStats episodes={props.episodes} />
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