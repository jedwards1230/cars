import React, { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonGroup, Dropdown, Nav, Navbar, NavDropdown } from "react-bootstrap";
import ConfigForm from "./trainConfig/configForm";

const NavComponent = (props: {
    children: ReactNode;
    run: () => void,
}) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <Navbar bg="light" className="px-3">
            <Navbar.Brand as={Link} to="/cars">Miles' Driving School</Navbar.Brand>
            <Nav className="ms-auto">
                {props.children}

                <Dropdown as={ButtonGroup}>
                    <Button variant="success" onClick={props.run}>Run</Button>

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