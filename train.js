

export function train(model, env, maxTimeSteps) {
    let reward = 0;
    let speed = 0;
    let count = 0;
    let observation = model.getSensorData(env.road.borders, env.traffic);
    for(let j=0; j<maxTimeSteps; j++) {
        env.update();

        const chosen = model.brain.selectAction(observation);
        const prev_distance = model.distance;
        const prev_observation = observation;

        model.updateControls(chosen);
        env.traffic = model.update(env.road.borders, env.traffic);

        let metrics = {
            action: chosen,
            damaged: model.damaged,
            prev_distance: prev_distance,
            next_distance: model.distance,
            acceleration: model.acceleration,
            speed: model.speed,
        }
        metrics.reward = model.brain.reward(metrics);
        observation = model.getSensorData(env.road.borders, env.traffic);

        model.brain.remember(metrics, observation, prev_observation);
        model.brain.experienceReplay(20);

        reward += metrics.reward;
        speed += model.speed;
        count++;

        if(model.damaged || j === maxTimeSteps - 1) {
            break;
        }
    }
    return {
        reward: (reward / count).toFixed(2),
        speed: (speed / count).toFixed(2),
        damaged: model.damaged,
        distance: model.distance.toFixed(2),
        weights: model.brain.save(),
    };
}
