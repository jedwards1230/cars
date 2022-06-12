export async function train(model, env, maxTimeSteps) {
    let speeds = [];
    let loss = [];
    let rLoss = 1;
    let count = 0;
    let actionValues, action, reward;

    const backprop = () => {
        // create reward gradient
        const expected = new Array(actionValues.length).fill(0);
        expected[action] = reward;

        // find average loss
        const avgLoss = model.brain.lossFunction(actionValues, expected);
        loss.push(avgLoss);

        // derivate of loss function
        const d = new Array(actionValues.length);
        for (let i = 0; i < actionValues.length; i++) {
            d[i] = actionValues[i] - expected[i];
        }

        // backward pass to update weights
        model.brain.backward(d);

        return avgLoss;
    }

    // loop until max time steps or car damaged
    for (let i = 0; i < maxTimeSteps; i++) {
        // update environment
        env.update();
        const [observation, metrics] = model.getObservation(env.road.borders, env.traffic);
        reward = metrics.reward;

        // forward pass to get action
        actionValues = model.brain.forward(observation);
        action = model.brain.makeChoice(actionValues, true);

        // maybe use for reward or input?
        const time = 1 - (1 / (i + 1));

        // apply action to model
        env.traffic = model.update(env.traffic, env.road.borders, action);

        // metrics
        speeds.push(model.speed);
        count++;

        if (rLoss > 0.01 || model.damaged) rLoss = backprop();

        if (model.damaged) break;
    }

    return {
        time: count,
        loss: rLoss,
        speed: Math.max(...speeds),
        distance: model.distance,
        damaged: model.damaged,
        model: model.brain,
    };
}