import React, { useEffect, useState } from "react";
import NetworkLayerList from "./layerConfig";
import SimConfig from "./simConfig";
import { ModelConfig, LayerConfig } from "../../network/config";
import { Form, Row, Col, ProgressBar, Accordion } from "react-bootstrap";

const TrainConfigForm = props => {
    const [episodeCounter, setEpisodeCounter] = useState(props.episodeCounter);
    const [numEpisodes, setNumEpisodes] = useState(1000);
    const [numSteps, setNumSteps] = useState(2000);
    const [epsilonDecay, setEpsilonDecay] = useState(props.modelConfig.epsilonDecay);
    const [mutationRate, setMutationRate] = useState(props.modelConfig.mutationRate);
    const [learningRate, setLearningRate] = useState(props.modelConfig.lr);
    const [sensorCount, setSensorCount] = useState(props.modelConfig.sensorCount);
    const [actionCount, setActionCount] = useState(props.modelConfig.actionCount);
    const [counter, setCounter] = useState(props.modelConfig.layers.length - 1);

    const [layers, setLayers] = useState(props.modelConfig.layers);

    const submitForm = () => {
        const modelConfig = new ModelConfig(props.modelConfig.name, props.modelConfig.alias);
        modelConfig.epsilonDecay = epsilonDecay;
        modelConfig.mutationRate = mutationRate;
        modelConfig.lr = learningRate;
        modelConfig.sensorCount = sensorCount;
        modelConfig.actionCount = actionCount;
        modelConfig.layers = layers;
        modelConfig.numEpisodes = numEpisodes;
        modelConfig.numSteps = numSteps;

        props.beginTrain(modelConfig);
    }

    const removeLayer = (id) => {
        if (layers.length > 1) {
            const newList = layers.filter((item) => item.id !== id);
            setLayers(newList);
            setCounter(newList.length - 1);
        }
    }

    const updateLayer = (id, activation, inputs, outputs) => {
        const newLayers = [...layers];
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
            id: counter + 1
        }]);
        setCounter(counter + 1);
    }

    const setAction = val => {
        setActionCount(val);
        const newLayers = [...layers];
        if (!isFinite(val)) val = 0;
        newLayers[newLayers.length - 1].outputs = val;
        setLayers(newLayers);
    }

    useEffect(() => {
        setEpisodeCounter(props.episodeCounter);
    }, [props.episodeCounter]);

    return (
        <div className="trainForm">
            <div id="trainParams" className="container text-center text-bg-light">
                <Form>
                    <Accordion defaultActiveKey="0" flush className="py-2 my-1">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Training Parameters</Accordion.Header>
                            <Accordion.Body>
                                <SimConfig 
                                    numEpisodes={numEpisodes}
                                    setNumEpisodes={setNumEpisodes}
                                    numSteps={numSteps}
                                    setNumSteps={setNumSteps} />
                                <Row className="py-3">
                                    <Col>
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={props.modelConfig.epsilonDecay}
                                                onChange={e => setEpsilonDecay(parseFloat(e.target.value))}></input>
                                            <label htmlFor="epsilonDecayInput">Epsilon Decay Rate</label>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={props.modelConfig.mutationRate}
                                                onChange={e => setMutationRate(parseFloat(e.target.value))}></input>
                                            <label htmlFor="mutationRateInput">Mutation Rate</label>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="form-floating">
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue={props.modelConfig.lr}
                                                onChange={e => setLearningRate(parseFloat(e.target.value))}></input>
                                            <label htmlFor="learningRateInput">Learning Rate</label>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <div className="form-floating">
                                            <input
                                                type="number"
                                                className="form-control"
                                                defaultValue={props.modelConfig.sensorCount}
                                                onChange={e => setSensorCount(parseInt(e.target.value))}></input>
                                            <label htmlFor="sensorCountInput">Sensor Count</label>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="form-floating">
                                            <input
                                                type="number"
                                                className="form-control"
                                                defaultValue={props.modelConfig.actionCount}
                                                onChange={e => setAction(parseInt(e.target.value))}></input>
                                            <label htmlFor="actionCountInput">Action Count</label>
                                        </div>
                                    </Col>
                                </Row>
                                <NetworkLayerList layers={layers} onRemove={removeLayer} addLayer={addLayer} updateLayer={updateLayer} />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <ProgressBar now={episodeCounter} max={numEpisodes} className="my-2" />
                    <button type="button" onClick={submitForm} id="trainBtn" className="btn mb-3 btn-primary">Start</button>
                </Form>
            </div>
        </div>
    );
}

export default TrainConfigForm