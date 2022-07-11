import React from "react";
import { useFormContext } from "react-hook-form";
import { Row, Col } from "react-bootstrap";

/** Number of simulations and steps per simulation */
const SimConfig = () => {
    const { register } = useFormContext();
    return (
        <>
            <Row className="py-3">
                <Col>
                    <div className="form-floating">
                        <input
                            {...register("trafficCount")}
                            type="number"
                            className="form-control"></input>
                        <label htmlFor="episodeCountInput">Traffic Count</label>
                    </div>
                </Col>
                <Col>
                    <div className="form-floating">
                        <input
                            {...register("smartCarCount")}
                            type="number"
                            className="form-control"></input>
                        <label htmlFor="timeLimitInput">Smart Car Count</label>
                    </div>
                </Col>
                <Col>
                    <div className="form-floating">
                        <input
                            {...register("mutationAmount")}
                            type="text"
                            className="form-control"></input>
                        <label htmlFor="mutationAmountInput">Mutation Amount</label>
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
            </Row>
        </>
    )
}

export default SimConfig;