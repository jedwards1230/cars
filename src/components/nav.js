import React, {useContext} from "react";
import { AppContext } from "../App.js";

const NavComponent = (props) => {
    const app = useContext(AppContext);
    return (
        <nav id="nav" className="navbar px-3 navbar-expand bg-light">
            <a className="navbar-brand" href="index.html">Miles' Driving School</a>
            <div className="ms-auto navbar-text">
                <span id="activeModel" className="px-2 me-auto navbar-text">
                    model = "{props.activeModel}"
                </span>
                <span id="activeSpeed" className="px-2 navbar-text">
                    speed = {app.model.speed}
                </span>
                <span id="activeDistance" className="px-2 navbar-text">
                    distance = {app.model.distance}
                </span>
                <button id="saveBtn" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Save Weights"
                    className="btn btn-outline-primary">💾</button>
                <button id="destroyBtn" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Discard Weights"
                    className="btn btn-outline-danger">🗑️</button>
                <button id="resetBtn" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Break Loop"
                    className="btn btn-outline-success">♻️</button>
                <button id="toggleView" onClick={props.toggleView} data-bs-toggle="tooltip" data-bs-placement="bottom" title=""
                    className="btn btn-outline-primary">View</button>
            </div>
        </nav>
    )
}

export default NavComponent;