import React, { useState } from "react";
import { Menu, MenuItem } from "@mui/material"
import Link from "next/link";
import styles from "./Navbar.module.css";
import Modal from "../configForm/configForm";

const NavComponent = (props: {
    metrics: NavMetrics;
    run: () => void,
    saveModel?: () => void,
    destroyModel?: () => void,
}) => {
    const [showConfigForm, setConfigForm] = useState(false);
    const closeConfigForm = () => setConfigForm(false);
    const openConfigForm = () => setConfigForm(true);


    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

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

            <div className={styles.controlBtns}>
                {props.saveModel &&
                    <button
                        className={styles.green}
                        onClick={props.saveModel}
                        title={"Save Model"}>💾</button>}
                {props.destroyModel &&
                    <button
                        className={styles.red}
                        onClick={props.destroyModel}
                        title={"Destroy Model"}>🗑️</button>}
                <button
                    className={styles.blue}
                    onClick={props.run}>Run</button>
            </div>

            <button onClick={openConfigForm}>
                Settings
            </button>
            <Modal open={showConfigForm} close={closeConfigForm} />

            <button
                className={styles.modeMenuBtn}
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                Mode
            </button>
            <Menu
                className={styles.modeMenu}
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleClose}>
                    <Link href='/'>View</Link>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <Link href='/teach'>Teach</Link>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <Link href='/genetic'>Genetic</Link>
                </MenuItem>
            </Menu>
        </div>
    )
}

export default NavComponent;