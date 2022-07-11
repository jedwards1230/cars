import React, { useContext, useEffect } from "react";
import { Accordion, Button, ListGroup, Modal, Table } from "react-bootstrap";
import { AppContext } from "../context";
import { Layer } from "../network/layers";

const WeightsModal = (props: {
    show: boolean;
    handleHide: () => void;
}) => {
    const appContext = useContext(AppContext);
    const sim = appContext.sim;



    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appContext.sim.smartCars]);

    return (
        <Modal
            show={props.show}
            onHide={props.handleHide}
            size="lg">
            <Modal.Header closeButton>
                <Modal.Title>"Weights and Biases"</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Accordion flush>
                    {sim.smartCars.map((car, i) => {
                        return (
                            <>
                                <Accordion.Item key={i+"weightsModal"} eventKey={i.toFixed(0)}>
                                    <Accordion.Header>Car {car.id}</Accordion.Header>
                                    <Accordion.Body>
                                        <p>Distance: {car.distance}</p>
                                        <p>Cars Passed: {car.carsPassed}</p>
                                        <LayersEntry layers={car.brain.layers} />
                                    </Accordion.Body>
                                </Accordion.Item>
                            </>
                        )
                    })}
                </Accordion>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.handleHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const LayersEntry = (props: { layers: Layer[] }) => {
    return (
        <>
            <Accordion>
                {props.layers.map((layer, i) => {
                    return (
                        <>
                            <Accordion.Item key={i + "layersEntry"} eventKey={i.toFixed(0)}>
                                <Accordion.Header>Layer {i}</Accordion.Header>
                                <Accordion.Body as={LayerEntry} layer={layer} />
                            </Accordion.Item>
                        </>
                    )
                })}
            </Accordion>
        </>
    )
}

const LayerEntry = (props: { layer: Layer }) => {
    return (
        <>
            <Accordion flush>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Weights</Accordion.Header>
                    <Accordion.Body as={WeightsEntry} weights={props.layer.weights} />
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Biases</Accordion.Header>
                    <Accordion.Body as={BiasesEntry} biases={props.layer.biases} />
                </Accordion.Item>
            </Accordion>
        </>
    )
}

// display weights in a dropdown table
const WeightsEntry = (props: { weights: number[][] }) => {
    return (
        <Table striped bordered hover>
            <tbody>
                {props.weights.map((row, i) => {
                    return (
                        <tr key={i + "weightRow"}>
                            {row.map((weight, j) => {
                                return (
                                    <td key={j + "weight"}>{weight}</td>
                                )
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}

//display biases in a dropdown table
const BiasesEntry = (props: { biases: number[] }) => {
    return (
        <ListGroup>
            {props.biases.map((bias, i) => {
                return <ListGroup.Item key={i+"bias"}>{bias}</ListGroup.Item>
            })}
        </ListGroup>
    )
}

export default WeightsModal;