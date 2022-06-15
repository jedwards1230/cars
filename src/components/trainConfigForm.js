import React from "react";

const TrainConfigForm = props => {
    return (
        <div className="trainForm">
            <div id="trainParams" className="container text-center text-bg-light">
                <h5 className="p-3">Training Parameters</h5>
                <form>
                    <div className="row py-2">
                        <div className="col">
                            <div className="form-floating mb-3">
                                <input type="number" className="form-control" defaultValue={props.numEpisodes} id="episodeCountInput"></input>
                                <label htmlFor="episodeCountInput">Episode Count</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-floating mb-3">
                                <input type="number" className="form-control" defaultValue={props.numSteps} id="timeLimitInput"></input>
                                <label htmlFor="timeLimitInput">Time Limit</label>
                            </div>
                        </div>
                    </div>
                    <div className="row pb-2">
                        <div className="col">
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" defaultValue={props.epsilonDecay} id="epsilonDecayInput"></input>
                                <label htmlFor="epsilonDecayInput">Epsilon Decay Rate</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" defaultValue={props.learningRate} id="learningRateInput"></input>
                                <label htmlFor="learningRateInput">Learning Rate</label>
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={props.beginTrain} id="trainBtn" className="btn mb-3 mx-0 btn-primary">Start</button>
                </form>
            </div>
        </div>
    );
}

export default TrainConfigForm