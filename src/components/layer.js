import { useState } from "react";
import { Form, Button, Table } from "react-bootstrap";

const NetworkLayerList = props => {
    return (
        <Table borderless size="sm">
            <thead>
                <tr>
                    <th>Input</th>
                    <th>Output</th>
                    <th>Activation</th>
                    <th><Button variant="success" onClick={props.addLayer} >+</Button></th>
                </tr>
            </thead>
            <tbody>
                {props.layers.map((layer, index) => (
                    <NetworkLayerItem key={layer.id} item={layer} onRemove={props.onRemove} updateLayer={props.updateLayer} />
                ))}
            </tbody>
        </Table>
    )
}

const NetworkLayerItem = props => {
    const [activation, setActivation] = useState(props.item.activation);
    const [inputs, setInputs] = useState(props.item.inputs);
    const [outputs, setOutputs] = useState(props.item.outputs);

    const updateLayer = (activation, inputs, outputs) => {
        setActivation(activation);
        setInputs(inputs);
        setOutputs(outputs);
        props.updateLayer(props.item.id, activation, inputs, outputs);
    }

    return (
        <tr>
            <td>
                <input
                    type="text"
                    className="form-control"
                    defaultValue={inputs}
                    onChange={e => updateLayer(activation, e.target.value, outputs)} ></input>
            </td>
            <td>
                <input
                    type="text"
                    className="form-control"
                    defaultValue={outputs}
                    onChange={e => updateLayer(activation, inputs, e.target.value)} ></input>
            </td>
            <td>
                <Form.Select defaultValue={activation} onChange={e => updateLayer(e.target.value, inputs, outputs)}>
                    <option value="Linear">Linear</option>
                    <option value="Relu">Relu</option>
                    <option value="LeakyRelu">LeakyRelu</option>
                    <option value="Sigmoid">Sigmoid</option>
                    <option value="Tanh">Tanh</option>
                </Form.Select>
            </td>
            <td>
                <Button variant="danger" onClick={() => props.onRemove(props.item.id)}>-</Button>
            </td>
        </tr>
    )
}

export default NetworkLayerList;
