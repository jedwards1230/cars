

export function train(model, env, maxTimeSteps) {
    let speed = 0;
    let rewards = 0;
    let count = 0;

    let metrics = {
        damaged: model.damaged,
        distances: [0, model.distance],
        maxSpeed: model.maxSpeed,
        speeds: [model.speed],
        sensorOffsets: model.getSensorData(env.road.borders, env.traffic),
        reward: 0,
    }

    let observation = [model.speed, model.distance].concat(metrics.sensorOffsets);
    
    for(let i=0; i<maxTimeSteps; i++) {
        // store previous data
        const prev_observation = observation;

        // update car
        env.update();
        const action = model.brain.selectAction(observation, true);
        model.updateControls(action);
        env.traffic = model.update(env.road.borders, env.traffic);
        model.damaged = model.distance <= -10 ? true : model.damaged;

        // update metrics
        metrics.sensorOffsets = model.getSensorData(env.road.borders, env.traffic);
        metrics.damaged = model.damaged;
        metrics.distances.push(model.distance);
        metrics.speeds.push(model.speed);

        // calculate reward
        metrics.reward = model.brain.reward(metrics);

        // observe environment
        observation = [model.speed, model.distance].concat(metrics.sensorOffsets);

        // remember this state
        if(i % 10 == 0 || model.damaged || Math.max(metrics.sensorOffsets) > 0.3) {
            model.brain.remember(metrics, action, observation, prev_observation);
        } 
        //model.brain.remember(metrics, action, observation, prev_observation);
        model.brain.experienceReplay(20, model.damaged);

        // update return info
        rewards += metrics.reward;
        speed += model.speed;
        count++;

        if(model.damaged || i >= maxTimeSteps) break;
    }
    return {
        metrics: metrics,
        time: count,
        reward: (rewards / count).toFixed(2),
        damaged: model.damaged,
        brain: model.brain.save(),
    };
}
