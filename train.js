import { Network } from "./network.js";

export function train(model, env, maxTimeSteps) {
    let reward = 0;
    let speed = 0;
    let count = 0;
    for(let j=0; j<maxTimeSteps; j++) {
        // todo: something about this feels out of order
        const prev_observation = model.getSensorData(env.road.borders, env.traffic);

        const action = model.brain.forward(prev_observation);
        const prev_distance = model.distance;

        env.update();
        model.updateControls(action);
        model.update(env.road.borders, env.traffic);

        const observation = model.getSensorData(env.road.borders, env.traffic);

        const metrics = {
            damaged: model.damaged,
            distances: [prev_distance, model.distance],
            speed: model.speed,
        }

        metrics.reward = model.brain.reward(metrics);
        reward += metrics.reward;
        speed += model.speed;
        count++;


        //console.log(metrics);
        model.brain.remember(metrics, action, observation, prev_observation);
        
        model.brain.experienceReplay(20);

        if(model.damaged || j === maxTimeSteps - 1) {
            //console.log("Episode finished after " + j + " time steps");
            break;
        }
    }
    localStorage.setItem("trainBrain", JSON.stringify(model.brain.save()));
    return {
        reward: reward.toFixed(2),
        speed: (speed / count).toFixed(2),
        damaged: model.damaged,
        distance: model.distance,
        weights: model.brain.save(),
    };
}
