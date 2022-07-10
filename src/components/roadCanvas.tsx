import React, { useRef, useEffect, useState } from "react";
import { Simulator } from "../car/simulator";
import { RoadCanvasDefaultHeight } from "../constants";

const RoadCanvas = (props: {
    sim: Simulator
}) => {
    const canvasRef = useRef(null)
    const [sim, setSim] = useState(props.sim);

    useEffect(() => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        canvas.width = window.innerWidth;

        sim.draw(canvas);
    })

    useEffect(() => {
        setSim(props.sim);
    }, [props.sim]);

    return <canvas ref={canvasRef} id="carCanvas" width={window.innerWidth} height={RoadCanvasDefaultHeight} />
}

export default RoadCanvas;