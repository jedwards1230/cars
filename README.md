# Miles' Driving School

The project began with [this](https://www.youtube.com/watch?v=Rs_rAxEsAvI) tutorial. I wanted to take it further with different training algorithms and a UI. 

Working demo is [here](https://jedwards1230.github.io/cars/)

## Project Goals
  * Learn Javascript/Typescript
  * Learn React
  * Gain better understanding of Machine Learning Algorithms

## Modes of Training
  * Neuroevolution of Augmenting Topologies (NEAT algorithm) (WIP)
    * Randomly generate a population of cars
    * Evaluate each car
    * Select the best car
    * Repeat with mutations of best car
  * Play-and-Teach (TO FIX)
    * Control the car with keyboard
    * Backpropagate with control input against network output predictions
  * Deep Reinforcement (TODO)
    * Many training loops with algorithms that generate "correct" output for training

## Todo
### UI
* Web workers for training?
* Form validation
  * Ensure network inputs/outputs are anchored to sensor inputs/action counts output
  * Establish better defaults
  * Tooltips or help would be cool
* Save/load specific networks
  * View of all saved models. editable?

### Network
* better system for how rewards/expected values are calculated
* better abstractions for network library
* create better default model that actually works
