import React, { useEffect, useRef } from "react";

const CanvasComponent = props => {
    const drawCars = () => {
		carCtx.save();
		carCtx.translate(carCanvas.height * 0.7 - model.x, 0);
		env.road.draw(carCtx);
		for (let i = 0; i < env.traffic.length; i++) {
			env.traffic[i].draw(carCtx);
			carCtx.globalAlpha = 1;
		}
		model.draw(carCtx, true);
		carCtx.restore();
	}

    const canvasRef = useRef()

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        vis.setContext(context);

        canvas.height = 450;
        canvas.width = window.innerWidth;
    }, []);

    return (
        <canvas id = {props.id} />
    )
}

export default CanvasComponent;