import { AppConfig } from './config';
import { Network } from './network';
import { Linear } from './layer';

const name = 'testConfig';
const alias = 'test';

describe('AppConfig', () => {
	it('load config', () => {
		const config = new AppConfig(name, alias);
		expect(config.name).toBe(name);
		expect(config.alias).toBe(alias);
		expect(config.layers.length).toBeGreaterThan(0);
		expect(config.sensorCount).toBeGreaterThan(0);
	})
})

describe('Network - 1 Neuron', () => {
	const layerConfig = {
		activation: 'Linear',
		inputs: 1,
		outputs: 1,
		lr: 0.001,
		id: 0,
		biases: [0],
		weights: [[0.5]],
	}
	const config = new AppConfig(name, alias);
	config.sensorCount = 1;
	config.layers = [layerConfig];

	it('load network', () => {
		const network = new Network(config);
		expect(network.name).toBe(name);
		expect(network.alias).toBe(alias);
		expect(network.layers.length).toBeGreaterThan(0);
	})

	describe('Layer - Linear', () => {
		layerConfig.activation = 'Linear';
		
		it('load layer', () => {
			const layer = new Linear(layerConfig);
			expect(layer.biases.length).toBe(layerConfig.biases.length);
			expect(layer.weights.length).toBe(layerConfig.weights.length);
		})
	
		// output = weight * input + bias
		// y = 0.5x + 0
		// expected output = [0.5]
		const input = [1];
		it('forward pass', () => {
			const layer = new Linear(layerConfig);
			const output = layer.forward(input);
			expect(output).toBeDefined();
			expect(output).not.toBeNull();
			expect(output.length).toBe(1);
			expect(output[0]).toBe(0.5);
		})

		it('train loop', () => {
			const network = new Network(config);
	
			// output = weight * input + bias
			// y = 0.5x + 0
			// expected output = [0.5]
			const input = [1];
			const output = network.forward(input, true);
			expect(output).toBeDefined();
			expect(output).not.toBeNull();
			expect(output.length).toBe(1);
			expect(output[0]).toBe(0.5);
	
			// find error gradient
			const expected = [0.5];
			const error = network.lossFunction(expected, output);
			expect(error).toBe(0);
			const gradient = network.deriveLoss(expected, output);
			expect(gradient.length).toBe(1);
			expect(gradient[0]).toBe(0);
	
			// update weights and biases
			// no error means no change
			// should be the same as the original config
			network.backward(gradient);
			const layer = network.layers[0];
			expect(layer.weights[0][0]).toBe(config.layers[0].weights![0][0]);
			expect(layer.biases[0]).toBe(config.layers[0].biases![0]);
		})
	})
})