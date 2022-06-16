import VisualizerCanvas from "./visualizerCanvas.js";
import React, { useEffect, useState } from "react";
import WelcomeView from "./welcome.js";
import NavComponent from "./nav.js";
import RoadCanvas from "./roadCanvas.js";
import MTable from "./mTable.js";
import TrainConfigForm from "./trainConfigForm.js";
import TrainStats from "./trainStats.js";

const MainView = props => {
    const [learningRate, setLearningRate] = useState(0.001);
    const [epsilonDecay, setEpsilonDecay] = useState(0.5);
    const [welcomed, setWelcomed] = useState(false);
    const [visualizer, setVisualizer] = useState(false);

    const setTrain = () => {
        setWelcomed(true);
        setVisualizer(false);
    }

    const setPlay = () => {
        setWelcomed(true);
        setVisualizer(true);
    }

    const toggleView = () => {
        setVisualizer(!visualizer);
        props.toggleView();
    }

    if (!welcomed) {
        return (
            <div id="mainView">
                <WelcomeView setTrain={setTrain} setPlay={setPlay} />
            </div>
        )
    } else {
        return (
            <div id="mainView">
                <NavComponent toggleView={toggleView} activeModel={props.activeModel} />
                <RoadCanvas id="carCanvas" height="300" />
                {visualizer ? (
                    <VisualizerCanvas
                        id="networkCanvas"
                        height="450"
                        brain={props.model.brain}
                        time={props.animationTime} />
                ) : (
                    <div id="train" className="trainView py-3 container-fluid">
                        <TrainConfigForm
                            beginTrain={props.beginTrain}
                            numEpisodes={props.numEpisodes}
                            numSteps={props.numSteps}
                            learningRate={learningRate}
                            epsilonDecay={epsilonDecay} />
                        {props.episodes.length > 0 && (
                            <div>
                                <MTable />
                                <RoadCanvas id="lossChart" />
                                <TrainStats />
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }
}

export default MainView;