

export function train(model, env, maxTimeSteps) {
    let speed = 0;
    let rewards = 0;
    let count = 0;

    let sensorOffsets = model.getSensorData(env.road.borders, env.traffic);
    let observation = [model.speed, model.distance].concat(sensorOffsets);

    let metrics = {
        damaged: false,
        prev_distance: 0,
        next_distance: model.distance,
        speed: 0,
        sensorOffsets: [],
        reward: 0,
    }
    
    for(let i=0; i<maxTimeSteps; i++) {
        env.update();

        const action = model.brain.selectAction(observation);
        const prev_observation = observation;

        // update car
        model.updateControls(action);
        metrics.prev_distance = metrics.next_distance;

        env.traffic = model.update(env.road.borders, env.traffic);
        metrics.damaged = model.damaged;

        metrics.next_distance = model.distance;
        metrics.speed = model.speed;

        // observe environment
        const sOffsets = model.getSensorData(env.road.borders, env.traffic);
        metrics.sensorOffsets = sOffsets;
        observation = [model.speed, model.distance].concat(sOffsets);

        // update metrics
        metrics.next_distance = model.distance;
        metrics.reward = model.brain.reward(metrics);

        // update brain
        if(i % 5 == 0 || model.damaged || Math.max(sOffsets) > 0.7) {
            model.brain.remember(metrics, action, observation, prev_observation);
        }
        model.brain.experienceReplay(20);

        // update return info
        rewards += metrics.reward;
        speed += model.speed;
        count++;

        if(model.damaged || i === maxTimeSteps - 1) break;
    }
    if(model.damaged) {
        rewards = -1;
    } else {
        rewards = rewards / count;
    }
    return {
        reward: rewards.toFixed(2),
        speed: (speed / count).toFixed(2),
        damaged: model.damaged,
        distance: model.distance.toFixed(2),
        weights: model.brain.save(),
    };
}
