import React from "react";
import { useFormContext } from "react-hook-form";
import { Row, Col } from "react-bootstrap";
import LayerList from "./layerConfig";

/** Number of simulations and steps per simulation */
const NetworkConfig = () => {
    const { register } = useFormContext();

    return (
        <div>
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
                            {...register("mutationRate")}
                            type="text"
                            className="form-control"></input>
                        <label htmlFor="mutationRateInput">Mutation Rate</label>
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
            <Row>
                <Col>
                    <div className="form-floating">
                        <input
                            {...register("sensorCount")}
                            type="number"
                            className="form-control"></input>
                        <label htmlFor="sensorCountInput">Sensor Count</label>
                    </div>
                </Col>
                <Col>
                    <div className="form-floating">
                        <input
                            {...register("actionCount")}
                            type="number"
                            className="form-control"></input>
                        <label htmlFor="actionCountInput">Action Count</label>
                    </div>
                </Col>
            </Row>
            <LayerList />
        </div>
    )
}

export default NetworkConfig;