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

    let observation = [model.speed / model.maxSpeed].concat(metrics.sensorOffsets);
    
    for(let i=0; i<maxTimeSteps; i++) {
        // store previous data
        const prev_observation = observation;

        // update car
        env.update();
        const action = model.brain.selectAction(observation, true);
        env.traffic = model.update(env.traffic, env.road.borders, action);

        // update metrics
        metrics.sensorOffsets = model.getSensorData(env.road.borders, env.traffic);
        metrics.damaged = model.damaged;
        metrics.distances.push(model.distance);
        metrics.speeds.push(model.speed);

        // calculate reward
        metrics.reward = model.brain.reward(metrics);

        // observe environment
        observation = [model.speed / model.maxSpeed].concat(metrics.sensorOffsets);
        //observation = metrics.sensorOffsets;
        const metricsMem = JSON.parse(JSON.stringify(metrics));

        model.brain.remember(metricsMem, action, observation, prev_observation);
        const loss = model.brain.experienceReplay(20, model.damaged);
        if (loss != null) console.log("Loss: " + loss);

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
