import React, { useEffect, useState } from "react";

const NavComponent = (props) => {
    const [activeModel, setActiveModel] = useState(props.activeModel);
    const [speed, setSpeed] = useState(0);
    const [distance, setDistance] = useState(0);

    useEffect(() => {
        setActiveModel(props.activeModel);
        setSpeed(props.model.speed.toFixed(1));
        setDistance(props.model.distance.toFixed(0));
    }, [props.model.speed, props.model.distance, props.activeModel]);

    return (
        <nav id="nav" className="navbar px-3 navbar-expand bg-light">
            <a className="navbar-brand" href="index.html">Miles' Driving School</a>
            <div className="ms-auto navbar-text">
                <span id="activeDistance" className="px-2 navbar-text">
                    distance = {distance}
                </span>
                <span id="activeSpeed" className="px-2 navbar-text">
                    speed = {speed}
                </span>
                <span id="activeModel" className="px-2 me-auto navbar-text">
                    model = "{activeModel}"
                </span>
                <button id="saveBtn" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Save Weights"
                    className="btn btn-outline-primary">💾</button>
                <button id="destroyBtn" onClick={props.destroy} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Discard Weights"
                    className="btn btn-outline-danger">🗑️</button>
                <button id="resetBtn" onClick={props.reset} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Break Loop"
                    className="btn btn-outline-success">♻️</button>
                <button id="toggleView" onClick={props.toggleView} data-bs-toggle="tooltip" data-bs-placement="bottom" title=""
                    className="btn btn-outline-primary">View</button>
            </div>
        </nav>
    )
}

export default NavComponent;