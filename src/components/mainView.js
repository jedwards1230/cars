import VisualizerComponent from "./vCanvas.js";
import React, {useState} from "react";
import WelcomeView from "./welcome.js";
import NavComponent from "./nav.js";
import CanvasComponent from "./canvas.js";
import MTable from "./mTable.js";
import TestForm from "./testForm.js";
import TrainStats from "./trainStats.js";

const MainView = props => {
    const [numEpisodes, setNumEpisodes] = useState(100);
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
    } else if (visualizer) {
        return (
            <div id="mainView">
                <NavComponent toggleView={toggleView} />
                <div id="train" className="trainView py-3 container-fluid">
                    <CanvasComponent id="carCanvas" height="300" />
                    <VisualizerComponent id="networkCanvas" height="450" />
                </div>
            </div>
        )
    } else {
        return (
            <div id="mainView">
                <NavComponent  toggleView={toggleView} />
                <div id="train" className="trainView py-3 container-fluid">
                    <CanvasComponent id="carCanvas" height="300" />
                    <TestForm />
                    <MTable />
                    <CanvasComponent id="lossChart" />
                    <TrainStats />
                </div>
            </div>
        )
    }
}

export default MainView;