import { Visualizer } from "./visualizer.js";
import React, { useEffect, useRef } from "react";


const VisualizerComponent = props => {

    const vis = new Visualizer();
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        vis.setContext(context);

        canvas.height = 450;
        canvas.width = window.innerWidth;
    }, []);

    return <canvas ref={canvasRef} id={props.id} width={window.innerWidth} height={props.height} />
}

export default VisualizerComponent;