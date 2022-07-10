import React from "react";
import { useFormContext } from "react-hook-form";
import { Row, Col } from "react-bootstrap";
import LayerList from "./layerConfig";

/** Number of simulations and steps per simulation */
const NetworkConfig = () => {
    const { register } = useFormContext();

    return (
        <>
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
        </>
    )
}

export default NetworkConfig;