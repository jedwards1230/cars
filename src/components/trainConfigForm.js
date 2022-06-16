import React, { useState } from "react";

const TrainConfigForm = props => {
    const [numEpisodes, setNumEpisodes] = useState(1000);
    const [numSteps, setNumSteps] = useState(1000);
    const [epsilonDecay, setEpsilonDecay] = useState(0.99);
    const [learningRate, setLearningRate] = useState(0.01);

    const submitForm = () => {
        props.beginTrain(numEpisodes, numSteps, epsilonDecay, learningRate);
    }

    return (
        <div className="trainForm">
            <div id="trainParams" className="container text-center text-bg-light">
                <h5 className="p-3">Training Parameters</h5>
                <form>
                    <div className="row py-2  mb-3">
                        <div className="col">
                            <div className="form-floating">
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    defaultValue={numEpisodes} 
                                    onChange={e => setNumEpisodes(e.target.value)} ></input>
                                <label htmlFor="episodeCountInput">Episode Count</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-floating">
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    defaultValue={numSteps} 
                                    onChange={e => setNumSteps(e.target.value)}></input>
                                <label htmlFor="timeLimitInput">Time Limit</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-floating">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    defaultValue={epsilonDecay} 
                                    onChange={e => setEpsilonDecay(e.target.value)}></input>
                                <label htmlFor="epsilonDecayInput">Epsilon Decay Rate</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-floating">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    defaultValue={learningRate} 
                                    onChange={e => setLearningRate(e.target.value)}></input>
                                <label htmlFor="learningRateInput">Learning Rate</label>
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={submitForm} id="trainBtn" className="btn mb-3 btn-primary">Start</button>
                </form>
            </div>
        </div>
    );
}

export default TrainConfigForm