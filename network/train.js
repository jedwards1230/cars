export async function train(model, env, maxTimeSteps) {
    let speeds = [];
    let rLoss = 1;
    let count = 0;
    let output = [];
    let action, reward;
    let prevOutput, prevReward;

    const backprop = () => {
        const gamma = 0.99;
        // create reward gradient
        const target = new Array(output.length).fill(0);
        target[action] = reward;

        // find average loss
        rLoss = model.brain.lossFunction(target, output);

        // derivate of loss function
        const d = new Array(output.length);
        for (let i = 0; i < output.length; i++) {
            d[i] = (target[i] - output[i]) * 2;
        }

        // backward pass to update weights
        model.brain.backward(d);
    }

    for (let i = 0; i < maxTimeSteps; i++) {
        // update environment
        env.update();
        const [observation, metrics] = model.getObservation(env.road.borders, env.traffic);
        reward = metrics.reward;

        // forward pass to get action
        prevOutput = JSON.parse(JSON.stringify(output));
        prevReward = reward;
        output = model.brain.forward(observation, true);
        const epsilonGreedy = true;
        action = model.brain.makeChoice(output, epsilonGreedy);

        // maybe use for reward or input?
        const time = 1 - (1 / (i + 1));
        const distance = 2 - (1 / (model.distance + 1));

        // apply action to model
        env.traffic = model.update(env.traffic, env.road.borders, action);

        // metrics
        speeds.push(model.speed);
        count++;

        if (prevOutput.length > 0 && (rLoss > 0.01 || model.damaged)) backprop();

        if (model.damaged) break;
    }

    return {
        time: count,
        loss: rLoss,
        speed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
        distance: model.distance,
        damaged: model.damaged,
        model: model.brain,
    };
}