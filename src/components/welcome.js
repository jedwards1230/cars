const WelcomeView = (props) => {
    return (
        <div id="welcome" className="text-center text-bg-light p-3">
            <h5>Welcome to Miles' Driving School</h5>
            <div>
                <button id="startTrain" onClick = {props.setTrain} className="btn mx-1 btn-dark">Train</button>
                <button id="startPlay" onClick = {props.setPlay} className="btn mx-1 btn-dark">Visualize</button>
            </div>
        </div>
    )
}

export default WelcomeView;