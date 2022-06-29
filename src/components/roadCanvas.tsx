import React, { useRef, useEffect, useState } from "react";
import { lerp } from "../utils";

import { Car } from "../car/car";
import { Environment } from "../car/environment";
import { Road } from "../car/road";
import { Sensor } from "../car/sensor";

const RoadCanvas = (props: {
    model: Car;
    env: Environment;
}) => {
    const drawSensor = (sensor: Sensor) => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;

        for (let i = 0; i < sensor.rayCount; i++) {
            if (!sensor.rays[i]) continue;
            let end = sensor.rays[i][1];
            if (sensor.readings[i]) {
                end = sensor.readings[i];
            }

            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = 'teal';
            context.moveTo(
                sensor.rays[i][0].x,
                sensor.rays[i][0].y,
            );
            context.lineTo(
                end.x,
                end.y,
            )
            context.stroke();

            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.moveTo(
                sensor.rays[i][1].x,
                sensor.rays[i][1].y,
            );
            context.lineTo(
                end.x,
                end.y,
            )
            context.stroke();
        }
    }

    const drawCar = (car: Car, drawSensors = false) => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;

        if (car.damaged) {
            context.fillStyle = "gray";
        } else {
            context.fillStyle = car.color;
            if (car.sensors && drawSensors) {
                drawSensor(car.sensors);
            }
        }

        context.beginPath();
        context.moveTo(car.polygon[0].x, car.polygon[0].y);
        for (let i = 1; i < car.polygon.length; i++) {
            context.lineTo(car.polygon[i].x, car.polygon[i].y)
        }
        context.fill();
    }

    const drawRoad = (road: Road) => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;

        context.lineWidth = 5;
        context.strokeStyle = "white";

        for (let i = 1; i <= road.laneCount - 1; i++) {
            const y = lerp(
                road.top,
                road.bottom,
                i / road.laneCount,
            );

            context.setLineDash([20, 20]);

            context.beginPath();
            context.moveTo(road.left, y);
            context.lineTo(road.right, y);
            context.stroke();
        }

        context.setLineDash([]);
        road.borders.forEach(border => {
            context.beginPath();
            context.moveTo(border[0].x, border[0].y);
            context.lineTo(border[1].x, border[1].y);
            context.stroke();
        })
    }

    const drawCars = (model: Car, env: Environment) => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;
        context.save();
        context.translate(canvas.height * 0.7 - model.x, 0);
        drawRoad(env.road);
        for (let i = 0; i < env.traffic.length; i++) {
            drawCar(env.traffic[i]);
            context.globalAlpha = 1;
        }
        drawCar(model, true);
        context.restore();
    }

    const canvasRef = useRef(null)
    const [model, setModel] = useState(props.model);
    const [env, setEnv] = useState(props.env);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        canvas.width = window.innerWidth;

        setModel(props.model);
        setEnv(props.env);

        drawCars(model, env)
    })

    return (
        <canvas ref={canvasRef} id="carCanvas" width={window.innerWidth} height="250" />
    )
}

export default RoadCanvas;