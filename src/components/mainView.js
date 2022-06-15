import VisualizerComponent from "./vCanvas.js";
import React, {useState} from "react";
import WelcomeView from "./welcome.js";
import NavComponent from "./nav.js";
import CanvasComponent from "./canvas.js";
import MTable from "./mTable.js";
import TrainConfigForm from "./trainConfigForm.js";
import TrainStats from "./trainStats.js";

const MainView = props => {
    const [numEpisodes, setNumEpisodes] = useState(100);
    const [numSteps, setNumSteps] = useState(1000);
    const [learningRate, setLearningRate] = useState(0.001);
    const [epsilonDecay, setEpsilonDecay] = useState(0.5);
    const [episodeCounter, setEpisodeCounter] = useState(0);
    const [breakLoop, setBreakLoop] = useState(false);
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
        setBreakLoop(true);
        setEpisodeCounter(numEpisodes);
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
                <NavComponent  toggleView={toggleView} activeModel={props.activeModel} activeSpeed={props.model.speed} activeDistance={props.model.distance} />
                <CanvasComponent id="carCanvas" height="300" model={props.model} env={props.env} />
                {visualizer ? (
                    <VisualizerComponent id="networkCanvas" height="450" />
                ) : (
                    <div id="train" className="trainView py-3 container-fluid">
                        <TrainConfigForm 
                            beginTrain={props.beginTrain} 
                            numEpisodes={numEpisodes} 
                            numSteps={numSteps}
                            learningRate={learningRate}
                            epsilonDecay={epsilonDecay} />
                        {props.episodes.length > 0 && (
                            <div>
                                <MTable />
                                <CanvasComponent id="lossChart" />
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