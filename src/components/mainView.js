import VisualizerCanvas from "./visualizerCanvas.js";
import React, { useEffect, useState, useContext} from "react";
import WelcomeView from "./welcome.js";
import NavComponent from "./nav.js";
import RoadCanvas from "./roadCanvas.js";
import MetricsTable from "./metricsTable.js";
import TrainConfigForm from "./trainConfigForm.js";
import TrainStats from "./trainStats.js";
import { AppContext } from "../App.js";

const MainView = props => {
    const app = useContext(AppContext);
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
                        height="450" />
                ) : (
                    <div id="train" className="trainView py-3 container-fluid">
                        <TrainConfigForm
                            beginTrain={props.beginTrain}
                            numEpisodes={props.numEpisodes}
                            numSteps={props.numSteps}
                            learningRate={learningRate}
                            epsilonDecay={epsilonDecay} />
                        {app.episodes.length > 0 && (
                            <div>
                                <MetricsTable episodes={app.episodes}/>
                                <TrainStats episodes={app.episodes} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }
}

export default MainView;