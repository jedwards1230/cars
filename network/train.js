export function train(model, env, maxTimeSteps) {
    let speeds = [];
    let loss = [];
    let count = 0;

    let [observation, metrics] = model.getObservation(env.road.borders, env.traffic);
    
    for(let i=0; i<maxTimeSteps; i++) {
        // store previous data
        const prev_observation = observation;

        // update car
        env.update();
        const action = model.brain.selectAction(observation, true);
        env.traffic = model.update(env.traffic, env.road.borders, action);

        // observe environment
        [observation, metrics] = model.getObservation(env.road.borders, env.traffic);

        model.brain.remember(metrics, action, observation, prev_observation);
        const rLoss = model.brain.experienceReplay(20, model.damaged);
        if (loss != null) {
            loss.push(rLoss);
            //if (i > maxTimeSteps / 2 && rLoss < 0.000001) break;
        }

        // update return info
        speeds.push(model.speed);
        count++;

        if(model.damaged || i >= maxTimeSteps) break;
    }
    const avgLoss = loss.reduce((a, b) => a + b, 0) / loss.length;
    let rLoss = isFinite(avgLoss) ? avgLoss : 0;
    return {
        metrics: metrics,
        time: count,
        loss: rLoss,
        speeds: speeds,
        distance: model.distance,
        damaged: model.damaged,
        brain: model.brain.save(),
    };
}
