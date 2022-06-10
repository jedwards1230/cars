let model, env;

export async function train(model, env, maxTimeSteps, batchSize = 20) {
    let speeds = [];
    let loss = [];
    let count = 0;

    let [observation, metrics] = model.getObservation(env.road.borders, env.traffic);

    for (let i = 0; i < maxTimeSteps; i++) {
        // store previous data
        const prev_observation = observation;

        // update car
        env.update();
        const action = model.brain.selectAction(observation);
        env.traffic = model.update(env.traffic, env.road.borders, action);
        speeds.push(model.speed);

        // observe environment
        [observation, metrics] = model.getObservation(env.road.borders, env.traffic);

        model.brain.remember(metrics, action, observation, prev_observation);
        const rLoss = model.brain.experienceReplay(batchSize, model.damaged);

        count++;

        if (rLoss != null) {
            loss.push(rLoss);
            if (rLoss == 0) break;
        }

        if (model.damaged || i >= maxTimeSteps) break;
    }
    const avgLoss = loss.reduce((a, b) => a + b, 0);
    let rLoss = isFinite(avgLoss) ? avgLoss : 0;
    return {
        metrics: metrics,
        time: count,
        loss: rLoss,
        speed: Math.max(...speeds),
        distance: model.distance,
        damaged: model.damaged,
        model: model.brain,
    };
}

// animate model
function animate(time) {
    // update cars
    env.update();
    if (!model.damaged) {
        const [observation, metrics] = model.getObservation(env.road.borders, env.traffic);
        const action = model.brain.selectAction(observation);
        env.traffic = model.update(env.traffic, env.road.borders, action);
    }

    document.getElementById("activeSpeedName").innerHTML = model.speed.toFixed(2);
    document.getElementById("activeDistanceName").innerHTML = model.distance.toFixed(0);

    // draw cars
    env.render();
    drawCars();
    drawVisualizer(time);
    animFrame = requestAnimationFrame(animate);
}