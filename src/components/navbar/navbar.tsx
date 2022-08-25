//import Link from "next/link";
import React, { ReactNode, useState } from "react";
import { DropdownButton, NavDropdown } from "react-bootstrap";
import ConfigForm from "../trainConfig/configForm";
import { Box, Typography, Button, ButtonGroup } from "@mui/material"

const NavComponent = (props: {
    children: ReactNode;
    run: () => void,
    saveModel?: () => void,
    destroyModel?: () => void,
}) => {
    const [showConfigForm, setConfigForm] = useState(false);
    const closeConfigForm = () => setConfigForm(false);
    const openConfigForm = () => setConfigForm(true);

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
                margin: "0.5rem 2rem",
            }}>
            <Typography>Miles Driving School</Typography>
            <Box>
                {props.children}
            </Box>

            <ButtonGroup>
                {props.saveModel &&
                    <Button
                        id="saveBtn"
                        variant="contained"
                        color="success"
                        onClick={props.saveModel}
                        title={"Save Model"}>💾</Button>}
                {props.destroyModel &&
                    <Button
                        id="destroyBtn"
                        variant="contained"
                        color="error"
                        onClick={props.destroyModel}
                        title={"Destroy Model"}>🗑️</Button>}
                <Button
                    variant="contained"
                    onClick={props.run}>Run</Button>
            </ButtonGroup>
        </Box>
    )
}

export default NavComponent;