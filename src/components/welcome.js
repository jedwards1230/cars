const WelcomeView = (props) => {
    const setPlay = () => {
        props.setWelcomed(true);
        props.setPlay();
    }

    const setTrain = () => {
        props.setWelcomed(true);
        props.setTrain();
    }


    return (
        <div id="welcome" className="text-center text-bg-light p-3">
            <h5>Welcome to Miles' Driving School</h5>
            <div>
                <button id="startTrain" onClick = {setTrain} className="btn mx-1 btn-dark">Train</button>
                <button id="startPlay" onClick = {setPlay} className="btn mx-1 btn-dark">Visualize</button>
            </div>
        </div>
    )
}

export default WelcomeView;