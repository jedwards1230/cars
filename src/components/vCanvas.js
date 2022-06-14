import { Visualizer } from "./visualizer.js";
import React, { useEffect, useRef } from "react";


export const VisualizerComponent = (props) => {

    const vis = new Visualizer();
    const canvasRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        vis.setContext(context);

        canvas.height = 450;
        canvas.width = window.innerWidth;
    }, []);

    return (<canvas ref={canvasRef} {...props} />)
}