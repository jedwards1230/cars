import React from "react";
import { useFormContext } from "react-hook-form";
import { Row, Col } from "react-bootstrap";

/** Number of simulations and steps per simulation */
const CarConfig = () => {
    const { register } = useFormContext();
    return (
        <Row>
            <Col>
                <div className="form-floating">
                    <input
                        {...register("activeModel")}
                        type="text"
                        className="form-control"></input>
                    <label htmlFor="episodeCountInput">Active Model</label>
                </div>
            </Col>
            <Col>
                <div className="form-floating">
                    <input
                        {...register("alias")}
                        type="text"
                        className="form-control"></input>
                    <label htmlFor="timeLimitInput">Alias</label>
                </div>
            </Col>
        </Row>
    )
}

export default CarConfig;