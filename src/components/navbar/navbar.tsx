//import Link from "next/link";
import React, { ReactNode, useState } from "react";
import { Button, ButtonGroup } from "@mui/material"
import Link from "next/link";
import styles from "./Navbar.module.css";

const NavComponent = (props: {
    metrics: NavMetrics;
    run: () => void,
    saveModel?: () => void,
    destroyModel?: () => void,
}) => {
    const [showConfigForm, setConfigForm] = useState(false);
    const closeConfigForm = () => setConfigForm(false);
    const openConfigForm = () => setConfigForm(true);

    return (
        <div className={styles.navbar}>
            <Link href='/'>
                <a className={styles.title}>Miles Driving School</a>
            </Link>
            <div className={styles.metrics}>
                {Object.entries(props.metrics).map(([k, v], i) => {
                    return (
                        <p key={i} id={k}>
                            {k}: {v}
                        </p>
                    )
                })}
            </div>

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
        </div>
    )
}

export default NavComponent;