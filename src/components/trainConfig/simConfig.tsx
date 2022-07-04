import React from "react";
import { useFormContext } from "react-hook-form";
import { Row, Col } from "react-bootstrap";

/** Number of simulations and steps per simulation */
const SimConfig = () => {
    const { register } = useFormContext();
    return (
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
    )
}

export default SimConfig;