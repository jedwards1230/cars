import React from "react";

const TestForm = (props) => {
    const numEpisodes = 1000;
    const numSteps = 1000;
    const learningRate = 0.001;
    const epsilonDecay = 0.5;
    //const activeModel = "trainBrain";

    /* const readInputs = () => {
        numEpisodes = parseInt(document.getElementById("episodeCountInput").value);
        numSteps = parseInt(document.getElementById("timeLimitInput").value);
        learningRate = parseFloat(document.getElementById("learningRateInput").value);
        epsilonDecay = parseFloat(document.getElementById("epsilonDecayInput").value);
    }

    const setValues = () => {
        document.getElementById("episodeCountInput").value = this.numEpisodes;
        document.getElementById("timeLimitInput").value = this.numSteps;
        document.getElementById("activeModelName").innerHTML = this.activeModel;
        document.getElementById("epsilonDecayInput").value = this.epsilonDecay;
        document.getElementById("learningRateInput").value = this.learningRate;
    } */

    return (
        <div className="trainForm">
            <div id="trainParams" className="container text-center text-bg-light">
                <h5 className="p-3">Training Parameters</h5>
                <form>
                    <div className="row py-2">
                        <div className="col">
                            <div className="form-floating mb-3">
                                <input type="number" className="form-control" defaultValue={numEpisodes} id="episodeCountInput"></input>
                                <label htmlFor="episodeCountInput">Episode Count</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-floating mb-3">
                                <input type="number" className="form-control" defaultValue={numSteps} id="timeLimitInput"></input>
                                <label htmlFor="timeLimitInput">Time Limit</label>
                            </div>
                        </div>
                    </div>
                    <div className="row pb-2">
                        <div className="col">
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" defaultValue={epsilonDecay} id="epsilonDecayInput"></input>
                                <label htmlFor="epsilonDecayInput">Epsilon Decay Rate</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" defaultValue={learningRate} id="learningRateInput"></input>
                                <label htmlFor="learningRateInput">Learning Rate</label>
                            </div>
                        </div>
                    </div>
                    <button type="button" id="trainBtn" className="btn mb-3 mx-0 btn-primary">Start</button>
                </form>
            </div>
        </div>
    );
}

export default TestForm