import { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import {
	Linear,
	Sigmoid,
	Relu,
	LeakyRelu,
	Tanh,
	SoftMax,
} from "../network/layers.js";

const LayerEntry = props => {
    const [layerActivation, setLayerActivation] = useState("Linear");
    const [layerInputs, setLayerInputs] = useState(10);
    const [layerOutputs, setLayerOutputs] = useState(10);
    const [layerLearningRate, setLayerLearningRate] = useState(0.01);

    const addLayer = () => {
        props.addLayer(layerActivation, layerInputs, layerOutputs, layerLearningRate);
    }

    // return a row with the layer entry, followed by a button to add the layer
    return (
        <Row className="py-2 mb-3">
            <Col>
                <div className="form-floating">
                    <input
                        type="text"
                        className="form-control"
                        defaultValue={layerActivation}
                        onChange={e => setLayerActivation(e.target.value)}></input>
                    <label htmlFor="layerActivationInput">Activation Function</label>
                </div>
            </Col>
            <Col>

                <div className="form-floating">
                    <input
                        type="text"
                        className="form-control"
                        defaultValue={layerInputs}
                        onChange={e => setLayerInputs(e.target.value)}></input>
                    <label htmlFor="layerInputsInput">Inputs</label>
                </div>
            </Col>
            <Col>
                <div className="form-floating">
                    <input
                        type="text"
                        className="form-control"
                        defaultValue={layerOutputs}
                        onChange={e => setLayerOutputs(e.target.value)}></input>
                    <label htmlFor="layerOutputsInput">Outputs</label>
                </div>
            </Col>
            <Col>
                <div className="form-floating">
                    <input
                        type="text"
                        className="form-control"
                        defaultValue={layerLearningRate}
                        onChange={e => setLayerLearningRate(e.target.value)}></input>
                    <label htmlFor="layerLearningRateInput">Learning Rate</label>
                </div>
            </Col>
            <Col>
                <div className="form-floating">
                    <Button variant="primary" onClick={addLayer}>Add Layer</Button>
                    <label htmlFor="layerLearningRateInput"></label>
                </div>
            </Col>
        </Row>
    );
}

    /* return (
        <Row className="my-auto">
            <Col>
                <Form.FloatingLabel controlId="floatingSelect" label="Activation Function">
                    <Form.Select>
                        <option>Linear</option>
                        <option>Relu</option>
                        <option>Leaky Relu</option>
                        <option>Sigmoid</option>
                        <option>Tanh</option>
                    </Form.Select>
                </Form.FloatingLabel>
            </Col>
            <Col>
                <Form.FloatingLabel controlId="floatingSelect" label="Layer Inputs">
                    <Form.Control 
                        type="number" 
                        defaultValue={layerInputs}
                        onChange={e => setLayerInputs(e.target.value)} />
                </Form.FloatingLabel>
            </Col>
            <Col>
                <Form.FloatingLabel controlId="floatingSelect" label="Layer Outputs">
                    <Form.Control 
                        type="number" 
                        defaultValue={layerOutputs}
                        onChange={e => setLayerOutputs(e.target.value)} />
                </Form.FloatingLabel>
            </Col>
            <Col>
            </Col>
        </Row>
    )
} */

export default LayerEntry;