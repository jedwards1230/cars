export async function train(model, env, maxTimeSteps) {
    let speeds = [];
    let loss = [];
    let rLoss = null;
    let count = 0;
    let actionValues, action, reward;

    const backprop = () => {
        // create reward gradient
        const expected = new Array(actionValues.length).fill(0);
        expected[action] = reward;

        // calculate loss gradient
        const cost = new Array(actionValues.length);
        for (let i = 0; i < actionValues.length; i++) {
            cost[i] = model.brain.lossFunction(actionValues[i], expected[i]);
        }

        // find average loss
        const avgLoss = cost.reduce((acc, cur) => acc + cur, 0) / cost.length;
        loss.push(avgLoss);

        // derivate of loss function
        const d = new Array(actionValues.length);
        for (let i = 0; i < actionValues.length; i++) {
            if (i != action) {
                d[i] = actionValues[i] - expected[i];
            } else {
                d[i] = actionValues[i] - expected[i];
            }
        }

        // backward pass to update weights
        model.brain.backward(d);

        return avgLoss;
    }

    for (let i = 0; i < maxTimeSteps; i++) {
        // update environment
        env.update();
        const [observation, metrics] = model.getObservation(env.road.borders, env.traffic);
        reward = metrics.reward;

        // forward pass to get action
        actionValues = model.brain.forward(observation);
        action = model.brain.makeChoice(actionValues, true);

        // apply action to model
        env.traffic = model.update(env.traffic, env.road.borders, action);

        // metrics
        speeds.push(model.speed);
        count++;

        rLoss = backprop();

        //if (model.distance < -100) model.damaged = true;
        if (model.damaged) break;
    }

    // ex. expected = [0, 0, reward, 0]
    // todo: not sure if this handles negative reward correctly
    // maybe inverse values instead of zero encode? 
    // but that will add positive action value to every single output instead of just desired
    // so this should really have a positive value for the correct action
    // todo: find correct action?
    

    return {
        time: count,
        loss: rLoss,
        speed: Math.max(...speeds),
        distance: model.distance,
        damaged: model.damaged,
        model: model.brain,
    };
}