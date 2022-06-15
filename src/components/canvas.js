import React, { useEffect, useRef } from "react";

const CanvasComponent = props => {
    const drawCars = (carCtx, canvas, model, env) => {
		carCtx.save();
		carCtx.translate(canvas.height * 0.7 - model.x, 0);
		env.road.draw(carCtx);
		for (let i = 0; i < env.traffic.length; i++) {
			env.traffic[i].draw(carCtx);
			carCtx.globalAlpha = 1;
		}
		model.draw(carCtx, true);
		carCtx.restore();
	}

    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
        //drawCars(context, canvas, props.model, props.env);
    }, []);

    return (
        <canvas ref={canvasRef} id={props.id} width={window.innerWidth} height={props.height}/>
    )
}

export const useCanvas = () => {
    const canvasRef = useRef(null)

    return canvasRef
}

export default CanvasComponent;