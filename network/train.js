export async function train(model, env, maxTimeSteps) {
    let speeds = [];
    let loss = [];
    let count = 0;
    let actionValues, action, reward;

    for (let i = 0; i < maxTimeSteps; i++) {
        // update environment
        env.update();
        const [observation, metrics] = model.getObservation(env.road.borders, env.traffic);
        reward = metrics.reward;

        // forward pass to get action
        actionValues = model.brain.forward(observation);
        action = model.brain.makeChoice(actionValues, false);

        // apply action to model
        env.traffic = model.update(env.traffic, env.road.borders, action);

        // metrics
        speeds.push(model.speed);
        count++;

        if (model.distance < -10) model.damaged = true;
        if (model.damaged) break;
    }

    // ex. expected = [0, 0, reward, 0]
    // todo: not sure if this handles negative reward correctly
    // maybe inverse values instead of zero encode? 
    // but that will add positive action value to every single output instead of just desired
    // so this should really have a positive value for the correct action
    // todo: find correct action?
    const expected = new Array(actionValues.length).fill(0);
    expected[action] = reward;

    // loss between expected and actual
    const rLoss = model.brain.lossFunction(actionValues, expected);
    if (rLoss != null) {
        loss.push(rLoss);
    }

    // delta for backpropagation
    const d = JSON.parse(JSON.stringify(actionValues));
    for (let i = 0; i < actionValues.length; i++) {
        d[i] -= expected[i];
    }

    // backward pass to update weights
    model.brain.backward(d);

    return {
        time: count,
        loss: rLoss,
        speed: Math.max(...speeds),
        distance: model.distance,
        damaged: model.damaged,
        model: model.brain,
    };
}