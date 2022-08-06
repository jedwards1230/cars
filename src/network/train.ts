import { SmartCar } from "../car/car";
import { Simulator } from "../car/simulator";

/**
 * Training Loop
 * 1. Update simulator
 * 2. Have car observe simulator
 * 3. Process observation with neural network
 * 4. Get action from neural network
 * 5. Calculate reward
 * 6. Update Car with action
 * 7. Backprop network with reward
 */
export function train(model: SmartCar, sim: Simulator, maxTimeSteps: number): TrainInfo {
    let speeds = [];
    let rLoss = 1;
    let count = 0;
    let output: number[] = [];
    let action: number[];
    let reward: number[];
    let prevOutput: number[];

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

        // derivative of loss function (how much gradient needs to be adjusted)
        const d = model.brain.deriveLoss(target, output);

        // backward pass to update weights
        model.brain.backward(d);
    }

    for (let i = 0; i < maxTimeSteps; i++) {
        // update simulator
        sim.update();
        //const observation = model.getObservation(sim.road.borders, sim.traffic);
        const input = model.getSensorData(sim.road.borders, sim.traffic);

        // forward pass to get action
        prevOutput = JSON.parse(JSON.stringify(output));
        output = model.brain.forward(input, true);
        const epsilonGreedy = true;
        action = model.brain.makeChoice(output, epsilonGreedy);

        // update metrics
        const metrics = model.getMetrics(action);
        reward = metrics.reward;

        // apply action to model
        model.update(sim.road.borders, sim.traffic, action);

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
