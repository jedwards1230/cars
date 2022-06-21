import { Row, Col } from "react-bootstrap";

/** Number of simulations and steps per simulation */
const SimConfig = props => {
    return (
        <Row>
            <Col>
                <div className="form-floating">
                    <input
                        type="number"
                        className="form-control"
                        defaultValue={props.numEpisodes}
                        onChange={e => props.setNumEpisodes(parseInt(e.target.value))} ></input>
                    <label htmlFor="episodeCountInput">Number of Simulations</label>
                </div>
            </Col>
            <Col>
                <div className="form-floating">
                    <input
                        type="number"
                        className="form-control"
                        defaultValue={props.numSteps}
                        onChange={e => props.setNumSteps(parseInt(e.target.value))}></input>
                    <label htmlFor="timeLimitInput">Steps per Simulation</label>
                </div>
            </Col>
        </Row>
    )
}

export default SimConfig;