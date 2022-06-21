/**
 * Training Loop
 * 1. Update environment
 * 2. Have car observe environment
 * 3. Process observation with neural network
 * 4. Get action from neural network
 * 5. Calculate reward
 * 6. Update Car with action
 * 7. Backprop network with reward
 */
export async function train(model, env, maxTimeSteps) {
    let speeds = [];
    let rLoss = 1;
    let count = 0;
    let output = [];
    let action, reward;
    let prevOutput;

    /**
     * Backpropagate the network with the reward
     * 1. Get the target output of the network
     * 2. Calculate the loss between the target and the output
     * 3. Find derivative of loss with respect to the output
     * 4. Backward propagate the loss
     */
    const backprop = () => {
        const target = reward;

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
        //const observation = model.getObservation(env.road.borders, env.traffic);
        const sData = model.getSensorData(env.road.borders, env.traffic);

        // forward pass to get action
        prevOutput = JSON.parse(JSON.stringify(output));
        output = model.brain.forward(sData, true);
        const epsilonGreedy = true;
        action = model.brain.makeChoice(output, epsilonGreedy);

        // update metrics
        const metrics = model.getMetrics(action);
        reward = metrics.reward;

        // maybe use for reward or input?
        //const time = 1 - (1 / (i + 1));
        //const distance = 2 - (1 / (model.distance + 1));

        // apply action to model
        model.update(env.traffic, env.road.borders, action);

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