import { Car } from "../car/car";
import { Simulator } from "../car/simulator";
import { Network } from "./network";

export type TrainInfo = {
    time: number,
    loss: number,
    speed: number,
    distance: number,
    damaged: boolean,
    model: Network,
}

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
export async function SGD(model: Car, sim: Simulator, maxTimeSteps: number): Promise<TrainInfo> {
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

export async function batchTrain(model: Car, sim: Simulator, maxTimeSteps: number): Promise<TrainInfo> {
    let speeds = [];
    let rLoss = 0;
    let count = 0;
    const batchSize = 32;
    const memory: any[] = [];
    let output: number[] = [];
    let prevOutput: number[] = [];
    let action;

    /**
     * Backpropagate the network with the reward
     * 1. Get the target output of the network
     * 2. Calculate the loss between the target and the output
     * 3. Find derivative of loss with respect to the output
     * 4. Backward propagate the loss
     */
    const backprop = (output: number[], target: number[]) => {
        const gamma = 0.99;
        // find average loss
        rLoss = model.brain.lossFunction(target, output);

        // derivative of loss function (how much gradient needs to be adjusted)
        const d = new Array(output.length);
        for (let i = 0; i < output.length; i++) {
            d[i] = (target[i] - output[i]) * 2;
        }

        const td = new Array(output.length);
        for (let i = 0; i < output.length; i++) {
            td[i] = target[i] + (gamma * output[i]) - prevOutput[i];
        }

        // backward pass to update weights
        if (rLoss !== 0) model.brain.backward(td);
        return rLoss
    }

    const experienceReplay = () => {
        if (memory.length < batchSize) return;
        let loss = 0;

        // get random batch from memory
        const index = Math.floor(Math.random() * memory.length);
        const batch = memory.slice(index, batchSize);
        batch.forEach(({ input, output, metrics }) => {
            loss += backprop(output, metrics.reward);
        });
        console.log(`Loss: ${loss / batchSize}`);
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

        memory.push({ input, output, metrics });
        experienceReplay();

        // apply action to model
        model.update(sim.road.borders, sim.traffic, action);

        // metrics
        speeds.push(model.speed);
        count++;

        if (model.damaged) break;
    }

    // splice out the last batch
    const batch = memory.splice(memory.length - batchSize, batchSize);

    batch.forEach(({ input, output, metrics }) => {
        backprop(output, metrics.reward);
    });

    return {
        time: count,
        loss: rLoss,
        speed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
        distance: model.distance,
        damaged: model.damaged,
        model: model.brain,
    };
}