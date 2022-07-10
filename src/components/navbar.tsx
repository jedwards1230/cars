import React, { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, ButtonGroup, DropdownButton, Nav, Navbar, NavDropdown } from "react-bootstrap";
import ConfigForm from "./trainConfig/configForm";

const NavComponent = (props: {
    children: ReactNode;
    run: () => void,
    saveModel?: () => void,
    destroyModel?: () => void,
}) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <Navbar bg="light" className="px-3">
            <Navbar.Brand as={Link} to="/cars">Miles' Driving School</Navbar.Brand>
            <Nav className="ms-auto">
                {props.children}

                <ButtonGroup>
                    {props.saveModel &&
                        <Button
                            id="saveBtn"
                            onClick={props.saveModel}
                            title={"Save Model"}
                            variant="outline-warning">💾</Button>}
                    {props.destroyModel &&
                        <Button
                            id="destroyBtn"
                            onClick={props.destroyModel}
                            title={"Destroy Model"}
                            variant="outline-danger">🗑️</Button>}
                    <Button variant="success" onClick={props.run}>Run</Button>
                    <DropdownButton as={ButtonGroup} title={"Mode"} align="end" >
                        <NavDropdown.Item 
                        eventKey="1.1" 
                        as={Link} 
                        to="/cars/genetic"
                        active={
                            useLocation().pathname === "/cars/genetic" ? true : false
                        }>Genetic</NavDropdown.Item>
                        <NavDropdown.Item 
                            eventKey="1.2" 
                            as={Link} 
                            to="/cars/teach" 
                            active={
                                useLocation().pathname === "/cars/teach" ? true : false
                            }>Teach</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={handleShow}>Config</NavDropdown.Item>
                    </DropdownButton>
                </ButtonGroup>
                <ConfigForm
                    show={show}
                    handleHide={handleClose} />
            </Nav>
        </Navbar>
    )
}

export default NavComponent;