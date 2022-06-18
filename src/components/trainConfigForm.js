import React, { useState } from "react";
import NetworkLayerList from "./layer";
import { Form, Row, Col } from "react-bootstrap";

const TrainConfigForm = props => {
    const [numEpisodes, setNumEpisodes] = useState(1000);
    const [numSteps, setNumSteps] = useState(1000);
    const [epsilonDecay, setEpsilonDecay] = useState(0.99);
    const [learningRate, setLearningRate] = useState(props.modelConfig.learningRate);
    const [counter, setCounter] = useState(props.modelConfig.layers.length);

    const [layers, setLayers] = useState(props.modelConfig.layers);

    const submitForm = () => {
        props.beginTrain(numEpisodes, numSteps, epsilonDecay, learningRate, layers);
    }

    const removeLayer = (id) => {
        if (layers.length > 1) {
            const newList = layers.filter((item) => item.id !== id);
            setLayers(newList);
        }
    }

    const updateLayer = (id, activation, inputs, outputs) => {
        let newLayers = [...layers];
        newLayers[id].activation = activation;
        newLayers[id].inputs = parseInt(inputs);
        newLayers[id].outputs = parseInt(outputs);
        setLayers(newLayers);
    }

    const addLayer = () => {
        setLayers([...layers, {
            activation: "Linear",
            inputs: null,
            outputs: null,
            id: counter+1
        }]);
        setCounter(counter+1);
    }

    return (
        <div className="trainForm">
            <div id="trainParams" className="container text-center text-bg-light">
                <h4 className="p-3">Training Parameters</h4>
                <Form>
                    <Row className="py-2 mb-3">
                        <Col>
                            <div className="form-floating">
                                <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={numEpisodes}
                                    onChange={e => setNumEpisodes(e.target.value)} ></input>
                                <label htmlFor="episodeCountInput">Episode Count</label>
                            </div>
                        </Col>
                        <Col>
                            <div className="form-floating">
                                <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={numSteps}
                                    onChange={e => setNumSteps(e.target.value)}></input>
                                <label htmlFor="timeLimitInput">Time Limit</label>
                            </div>
                        </Col>
                        <Col>
                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={epsilonDecay}
                                    onChange={e => setEpsilonDecay(e.target.value)}></input>
                                <label htmlFor="epsilonDecayInput">Epsilon Decay Rate</label>
                            </div>
                        </Col>
                        <Col>
                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={learningRate}
                                    onChange={e => setLearningRate(e.target.value)}></input>
                                <label htmlFor="learningRateInput">Learning Rate</label>
                            </div>
                        </Col>
                    </Row>
                    <NetworkLayerList layers={layers} onRemove={removeLayer} addLayer={addLayer} updateLayer={updateLayer} />
                    <button type="button" onClick={submitForm} id="trainBtn" className="btn mb-3 btn-primary">Start</button>
                </Form>
            </div>
        </div>
    );
}

export default TrainConfigForm