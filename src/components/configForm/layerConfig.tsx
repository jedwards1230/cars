import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button, Table } from "react-bootstrap";

const LayerList = () => {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "layers"
    });

    return (
        <Table borderless size="sm">
            <thead>
                <tr>
                    <th>Input</th>
                    <th>Output</th>
                    <th>Activation</th>
                    <th><Button
                        variant="success"
                        onClick={() => append({ inputs: "0", outputs: "0", activation: "Linear" })}>+</Button></th>
                </tr>
            </thead>
            <tbody>
                {fields.map((item, index) => {
                    return (
                        <NetworkLayerItem key={item.id} index={index} remove={remove} />
                    );
                })}
            </tbody>
        </Table>
    );
}

const NetworkLayerItem = (props: {
    index: number;
    remove: (index: number) => void;
}) => {
    const { register } = useFormContext();

    return (
        <tr>
            <td>
                <input
                    {...register(`layers.${props.index}.inputs`)}
                    type="text"
                    className="form-control" ></input>
            </td>
            <td>
                <input
                    {...register(`layers.${props.index}.outputs`)}
                    type="text"
                    className="form-control" ></input>
            </td>
            <td>
                <select
                    {...register(`layers.${props.index}.activation`)}>
                    <option value="Linear">Linear</option>
                    <option value="Relu">Relu</option>
                    <option value="LeakyRelu">LeakyRelu</option>
                    <option value="Sigmoid">Sigmoid</option>
                    <option value="Tanh">Tanh</option>
                </select>
            </td>
            <td>
                <Button variant="danger" onClick={() => props.remove(props.index)}>-</Button>
            </td>
        </tr>
    )
}

export default LayerList;