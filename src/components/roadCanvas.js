import React, { useRef, useContext, useEffect } from "react";
import { lerp } from "../utils.js";
import useAnimationFrame from "./animator.js";
import { AppContext } from "../App.js";

const RoadCanvas = props => {
    const drawSensor = (sensor) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

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

    const drawCar = (car, drawSensors = false) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (car.damaged) {
            context.fillStyle = "gray";
        } else {
            context.fillStyle = car.color;
            if (car.sensors && drawSensors) {
                drawSensor(car.sensors[0]);
            }
        }

        context.beginPath();
        context.moveTo(car.polygon[0].x, car.polygon[0].y);
        for (let i = 1; i < car.polygon.length; i++) {
            context.lineTo(car.polygon[i].x, car.polygon[i].y)
        }
        context.fill();
    }

    const drawRoad = (road) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

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

    const drawCars = (model, env) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
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

    useAnimationFrame(deltaTime => {
        app.env.update();
        if (!app.model.damaged) {
            //const observation = model.getObservation(env.road.borders, env.traffic);
            const sData = app.model.getSensorData(app.env.road.borders, app.env.traffic);
            const output = app.model.brain.forward(sData, true);
            const action = app.model.brain.makeChoice(output);
            //const action = model.lazyAction(env.road.borders, env.traffic, true);
            env.traffic = app.model.update(app.env.traffic, app.env.road.borders, action);
        }
        drawCars(app.model, app.env);
        app.setEnv(app.env);
        app.setModel(model);
        app.setFrame(app.frame + 1);
    }); 

    /* useEffect(() => {
        env.update();
        if (!model.damaged) {
            //const observation = model.getObservation(env.road.borders, env.traffic);
            const sData = model.getSensorData(env.road.borders, env.traffic);
            const output = model.brain.forward(sData, true);
            const action = model.brain.makeChoice(output);
            //const action = model.lazyAction(env.road.borders, env.traffic, true);
            env.traffic = model.update(env.traffic, env.road.borders, action);
        }
        drawCars(app.model, app.env);
        app.setEnv(env);
        app.setModel(app.model);
    }); */

    const app = useContext(AppContext);
    const env = app.env;
    const model = app.model;
    
    const canvasRef = useRef(null)

    return (
        <canvas ref={canvasRef} id={props.id} width={window.innerWidth} height={props.height} />
    )
}

export default RoadCanvas;