import React from "react";
import { useFormContext } from "react-hook-form";
import { Row, Col } from "react-bootstrap";

/** Number of simulations and steps per simulation */
const TrainingConfig = () => {
    const { register } = useFormContext();
    return (
        <>
            <Row>
                <Col>
                    <div className="form-floating">
                        <input
                            {...register("numEpisodes")}
                            type="number"
                            className="form-control"></input>
                        <label htmlFor="episodeCountInput">Number of Simulations</label>
                    </div>
                </Col>
                <Col>
                    <div className="form-floating">
                        <input
                            {...register("numSteps")}
                            type="number"
                            className="form-control"></input>
                        <label htmlFor="timeLimitInput">Steps per Simulation</label>
                    </div>
                </Col>
            </Row>
            <Row className="py-3">
                <Col>
                    <div className="form-floating">
                        <input
                            {...register("epsilonDecay")}
                            type="text"
                            className="form-control"></input>
                        <label htmlFor="epsilonDecayInput">Epsilon Decay Rate</label>
                    </div>
                </Col>
                <Col>
                    <div className="form-floating">
                        <input
                            {...register("learningRate")}
                            type="text"
                            className="form-control"></input>
                        <label htmlFor="learningRateInput">Learning Rate</label>
                    </div>
                </Col>
            </Row>
        </>
    )
}

export default TrainingConfig;