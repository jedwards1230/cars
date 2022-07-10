import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonGroup, Dropdown, Nav, Navbar, NavDropdown } from "react-bootstrap";
import ConfigForm from "./trainConfig/configForm";

const NavComponent = (props: {
    reset: () => void,
    stats: string[][];
    buttons: JSX.Element[];
}) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <Navbar bg="light" className="px-3">
            <Navbar.Brand as={Link} to="/cars">Miles' Driving School</Navbar.Brand>
            <Nav className="ms-auto">
                {props.stats.map((stat, i) => {
                    return (
                        <Navbar.Text
                            key={i}
                            id={stat[0]}
                            className="px-2">{stat[0]} = {stat[1]}</Navbar.Text>
                    )
                })}

                {props.buttons.map((button, i) => {
                    return button
                })}

                <Dropdown as={ButtonGroup}>
                    <Button variant="success" onClick={props.reset}>Run</Button>

                    <Dropdown.Toggle split variant="success" id="dropdown-basic" />

                    <Dropdown.Menu>
                        <NavDropdown.Item eventKey="1.1" as={Link} to="/cars/genetic">Genetic</NavDropdown.Item>
                        <NavDropdown.Item eventKey="1.2" as={Link} to="/cars/teach">Teach</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item eventKey="2.1" onClick={handleShow}>Config</NavDropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <ConfigForm
                    show={show}
                    handleHide={handleClose} />
            </Nav>
        </Navbar>
    )
}

export default NavComponent;