import React from "react";
import { states } from "../App";

const WelcomeView = (props: {
    setState: (arg0: string) => void;
}) => {
    const setPlay = () => {
        props.setState(states.visual);
    }

    const setTrain = () => {
        props.setState(states.train);
    }

    return (
        <div id="welcome" className="text-center text-bg-light p-3">
            <h5>Welcome to Miles' Driving School</h5>
            <p>
                This app is a simple driving simulator.
                The car is trained to drive around the track by using a reinforcement learning algorithm.
                You can design a model for the car and tweak various parameters to see how it performs.
            </p>
            <div>
                <button id="startTrain" onClick={setTrain} className="btn mx-1 btn-dark">Train</button>
                <button id="startPlay" onClick={setPlay} className="btn mx-1 btn-dark">Visualize</button>
            </div>
        </div>
    )
}

export default WelcomeView;