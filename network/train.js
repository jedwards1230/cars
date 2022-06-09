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
        const action = model.brain.selectAction(observation, true);
        env.traffic = model.update(env.traffic, env.road.borders, action);

        // observe environment
        [observation, metrics] = model.getObservation(env.road.borders, env.traffic);

        model.brain.remember(metrics, action, observation, prev_observation);
        const rLoss = await model.brain.experienceReplay(batchSize, model.damaged);
        if (loss != null) {
            loss.push(rLoss);
            const last = loss.length;
            //if (loss[last] == 0 && loss[last-1] == 0 && loss[last-2] == 0) break;
        }

        // update return info
        speeds.push(model.speed);
        count++;

        if (model.damaged || i >= maxTimeSteps) break;
    }
    const avgLoss = loss.reduce((a, b) => a + b, 0) / loss.length;
    let rLoss = isFinite(avgLoss) ? avgLoss : 0;
    return {
        metrics: metrics,
        time: count,
        loss: rLoss,
        speed: Math.max(...speeds),
        distance: model.distance,
        damaged: model.damaged,
        brain: model.brain.save(),
    };
}