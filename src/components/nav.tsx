import React, { useEffect, useState } from "react";
import { Button, Nav, Navbar } from "react-bootstrap";
import { Car } from "../car/car";
import { Simulator } from "../car/simulator";
import { AppConfig } from "../network/config";
import ConfigForm from "./trainConfig/configForm";

const NavComponent = (props: {
    modelConfig: AppConfig;
    model: Car;
    sim: Simulator
    state: string;
    activeModel: string;
    save: () => void;
    destroy: () => void;
    reset: () => void;
    startPlay: () => void;
    setActiveModel: (model: string) => void;
}) => {
    const [speed, setSpeed] = useState(0);
    const [distance, setDistance] = useState(0);
    const [activeBrains, setActiveBrains] = useState(props.sim.activeBrains);
    const [loss, setLoss] = useState("0");

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        setSpeed(parseFloat(props.model.speed.toFixed(1)));
        setDistance(parseFloat(props.model.distance.toFixed(0)));
        setActiveBrains(props.sim.activeBrains);
    }, [props.model.speed, props.model.distance, props.sim.activeBrains]);

    useEffect(() => {
        setLoss((props.sim.loss.loss / props.sim.loss.count).toFixed(4));
    }, [props.sim.loss.loss, props.sim.loss.count]);

    return (
        <Navbar bg="light" className="px-3">
            <Navbar.Brand href="index.html">Miles' Driving School</Navbar.Brand>
            <Nav className="ms-auto">
                <Navbar.Text
                    id="activeDistance"
                    className="px-2">distance = {distance}</Navbar.Text>
                <Navbar.Text
                    id="activeSpeed"
                    className="px-2">speed = {speed}</Navbar.Text>
                <Navbar.Text
                    id="activeBrains"
                    className="px-2">alive = {activeBrains}</Navbar.Text>
                <Navbar.Text
                    id="activeBrains"
                    className="px-2">loss = {loss}</Navbar.Text>
                <Navbar.Text
                    id="activeModel"
                    className="px-2">{props.activeModel}</Navbar.Text>
                <Button
                    id="saveBtn"
                    onClick={props.save}
                    title={"Save Model"}
                    variant="outline-warning">💾</Button>
                <Button
                    id="destroyBtn"
                    onClick={props.destroy}
                    title={"Destroy Model"}
                    variant="outline-danger">🗑️</Button>
                <Button
                    id="resetBtn"
                    onClick={props.reset}
                    title={"Reset Simulation"}
                    variant="outline-success">♻️</Button>
                <Button
                    id="configBtn"
                    onClick={handleShow}
                    title={"Config"}
                    variant="outline-dark">⚙️</Button>
                <Button
                    id="startPlay"
                    onClick={props.startPlay}
                    title={"Play"}
                    variant="outline-primary">Play</Button>
                <ConfigForm
                    show={show}
                    handleHide={handleClose}
                    setActiveModel={props.setActiveModel}
                    modelConfig={props.modelConfig} />
            </Nav>
        </Navbar>
    )
}

export default NavComponent;