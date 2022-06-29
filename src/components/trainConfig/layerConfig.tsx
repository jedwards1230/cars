import React from "react";
import { useEffect, useState } from "react";
import { Form, Button, Table } from "react-bootstrap";

const NetworkLayerList = (props: {
    addLayer: () => void;
    layers: any[];
    onRemove: any;
    updateLayer: any;
}) => {

    return (
        <Table borderless size="sm">
            <thead>
                <tr>
                    <th>Input</th>
                    <th>Output</th>
                    <th>Activation</th>
                    <th><Button variant="success" onClick={props.addLayer}>+</Button></th>
                </tr>
            </thead>
            <tbody>
                {props.layers.map((layer: any) => (
                    <NetworkLayerItem key={layer.id} item={layer} onRemove={props.onRemove} updateLayer={props.updateLayer} />
                ))}
            </tbody>
        </Table>
    )
}

const NetworkLayerItem = (props: {
    item: {
        activation: string;
        inputs: string;
        outputs: string;
        id: number;
    };
    updateLayer: (id: number, activation: string, inputs: string, outputs: string) => void;
    onRemove: (id: number) => void;
}) => {
    const [activation, setActivation] = useState(props.item.activation);
    const [inputs, setInputs] = useState(props.item.inputs);
    const [outputs, setOutputs] = useState(props.item.outputs);
    const id = props.item.id;

    const updateLayer = (activation: string, inputs: string, outputs: string) => {
        setActivation(activation);
        setInputs(inputs);
        setOutputs(outputs);
        props.updateLayer(id, activation, inputs, outputs);
    }

    useEffect(() => {
        setActivation(props.item.activation);
        setInputs(props.item.inputs);
        setOutputs(props.item.outputs);
    }, [props.item.activation, props.item.inputs, props.item.outputs]);

    return (
        <tr>
            <td>
                <input
                    type="text"
                    className="form-control"
                    defaultValue={props.item.inputs}
                    onChange={e => updateLayer(activation, e.target.value, outputs)} ></input>
            </td>
            <td>
                <input
                    type="text"
                    className="form-control"
                    defaultValue={props.item.outputs}
                    onChange={e => updateLayer(activation, inputs, e.target.value)} ></input>
            </td>
            <td>
                <Form.Select defaultValue={props.item.activation} onChange={e => updateLayer(e.target.value, inputs, outputs)}>
                    <option value="Linear">Linear</option>
                    <option value="Relu">Relu</option>
                    <option value="LeakyRelu">LeakyRelu</option>
                    <option value="Sigmoid">Sigmoid</option>
                    <option value="Tanh">Tanh</option>
                </Form.Select>
            </td>
            <td>
                <Button variant="danger" onClick={() => props.onRemove(id)}>-</Button>
            </td>
        </tr>
    )
}

export default NetworkLayerList;
