# Network Library

## Introduction

The network module provides a set of functions for building, training, and using a neural network.

This is mostly a learning tool to build an intuition for machine learning algorithms. I plan to continue building upon this to better understand fundamentals.

### Todo

* Add tests
* Add documentation
* Add Optimizers
* Add Loss Functions
* Add Metrics
* Learn about transformers and other neural network architectures

## Structure

### Network

The Network class is the main class for building and training neural networks. Pass in an AppConfig object and it will compile each of the layers and initialize the network.

```typescript
network: Network
config: AppConfig
greedy: boolean
inputs: number[]
outputs: number[]
loss: number
mutationRate: number

// Initialize network with config
const network = new Network(config);

// Train network with gradient descent
network.backward(loss);

// Get predictions
const predictions = network.forward(inputs);

// Evaluate with epsilon greedy policy
// Todo: this should maybe be checked before making the forward pass.
//       no point in forward pass if we end up with random choice.
const action = network.makeChoice(outputs, greedy);

// Trigger lr and epsilon decay
//
// Todo: I wanna separate this out and have swappable optimizers
//       for the network
network.decay();

// Compile network state into object
const state = network.saveLayers();

// Mutate the weights of the model
network.mutate(mutationRate);

```

### Layer

The Layer class is the base class for all layers in the network. This receives config from the Network class and initializes the layer.

Each layer used by the network (Relu, Linear, etc) is a subclass of this. This is where the core math for the machine learning is done.

Note: These functions should only be called from Layer or Network classes. The Network class manages most of the layer functions since it must distribute between differnt layer types.

```typescript
layer: Layer
config: LayerConfig
inputs: number[]
outputs: number[]
deltaGradient: number[]
backprop: boolean

// Initialize layer with config
//
// Note: using a subclass is required. Layer alone does not have 
//       enough information for the network
const layer = new Sigmoid(config);

// Forward pass
// This takes an input, multiplies the weights, adds the bias, 
// then applies the activation function
//
// Note: if backprop is true, then the input and output values 
//       will be saved to the layers memory
// Todo: coming back to this project, i wanna look into if the 
//       above note is necessary and why
const outputs = layer.forward(inputs, backprop);

// Backward pass
// This takes an array of values to adjust by (delta gradient)
// It focuses on producing three values:
//     1. The delta gradient for the weights
//     2. The delta gradient for the bias
//     3. The delta gradient for the input
// It updates the weights and bias values, then passes the delta along
const delta = layer.backward(delta);

// Update weights
// This takes the delta gradient produced by the backward pass
// 
// Todo: I think I'll need to refactor how the learning rate is 
//       applied when I start adding alternative optimizers
layer.updateWeights(deltaGradient);

// Update bias
// This takes the delta gradient produced by the backward pass
//
// Todo: I think I'll need to refactor how the learning rate is
//       applied when I start adding alternative optimizers
layer.updateBias(deltaGradient);

// Save layer state to object
const state = layer.save();

// Randomize weights and bias between -0.5 and 0.5
layer.randomize();
```

Supported Layers:

| Layer | Description |
| :---: | :---: |
| Linear | ```x => x``` |
| Sigmoid | ```x => 1 / (1 + Math.exp(-x))``` |
| Relu | ```x => x > 0 ? x : 0``` |
| LeakyRelu | ```x => x > 0 ? x : 0.01 * x``` |
| Tanh | ```x => Math.tanh(x)``` |
| Softmax | ```x => Math.exp(x) / Math.sum(Math.exp(x))``` |
| Dropout | ```x => Math.random() < this.dropRate ? 0 : x``` |

### Train

Note: This section is still a mess. I am in the process of reworking it. Thoughts and plan are below.

When I began this project, I had some notions of how to train a network and how the algorithms worked, but I never really understood the implementation side. Some things just never clicked. I've had a few different iterations of a working algorithm, but nothing I felt confident with and definitely nothing I really understood.

Since last working on this library, I have spent a good bit of time playing with mlagents for Unity games. Taking some time away from this project to play with that was very helpful. I was able to see how a network trains models in a variety of environments and a variety of inputs with different forms of training. This has helped build intuition and confidence with what to expect and what I want from this library.

Todo:

* Plan algorithm for discrete and continuous inputs
* Plan algorithm for imitation training
* Plan actor critic algorithm
* Plan fitness function
