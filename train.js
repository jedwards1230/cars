import { Network } from "./network.js";

export function train(model, env, maxTimeSteps) {
    let reward = 0;
    let speed = 0;
    let count = 0;
    let observation = model.getSensorData(env.road.borders, env.traffic);
    let distance = model.distance;
    for(let j=0; j<maxTimeSteps; j++) {
        env.update();

        const chosen = model.brain.selectAction(observation);
        const prev_distance = model.distance;
        const prev_observation = observation;

        observation = model.getSensorData(env.road.borders, env.traffic);
        console.log("observation", observation);

        model.updateControls(chosen);
        model.update(env.road.borders, env.traffic);

        const metrics = {
            action: chosen,
            damaged: model.damaged,
            distances: [prev_distance, model.distance],
            speed: model.speed,
        }

        metrics.reward = model.brain.reward(metrics);
        reward += metrics.reward;
        speed += model.speed;
        count++;


        console.log("metrics", metrics);
        model.brain.remember(metrics, observation, prev_observation);
        
        model.brain.experienceReplay(20);

        if(model.damaged || j === maxTimeSteps - 1) {
            //console.log("Episode finished after " + j + " time steps");
            break;
        }
    }
    return {
        reward: reward.toFixed(2),
        speed: (speed / count).toFixed(2),
        damaged: model.damaged,
        distance: model.distance,
        weights: model.brain.save(),
    };
}
