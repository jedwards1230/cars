import React, { useRef, useEffect, useState } from "react";
import { Environment } from "../car/environment";

const RoadCanvas = (props: {
    env: Environment;
}) => {
    const canvasRef = useRef(null)
    const [env, setEnv] = useState(props.env);

    useEffect(() => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        canvas.width = window.innerWidth;

        env.draw(canvas);
    })

    useEffect(() => {
        setEnv(props.env);
    }, [props.env]);

    return <canvas ref={canvasRef} id="carCanvas" width={window.innerWidth} height="250" />
}

export default RoadCanvas;