import React, { useEffect, useRef } from "react";

const CanvasComponent = (props) => {
    const canvasRef = useRef(props.id)
    return (
        <canvas id = {props.id} />
    )
}

export default CanvasComponent;