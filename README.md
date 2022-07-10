# Miles' Driving School

The project began with [this](https://www.youtube.com/watch?v=Rs_rAxEsAvI) tutorial. I wanted to take it further with different training algorithms and a UI. 

Working demo is [here](https://jedwards1230.github.io/cars/)

## Project Goals
  * Learn Javascript/Typescript
  * Learn React
  * Gain better understanding of Machine Learning Algorithms

## Modes of Training
  * Genetic
    * Randomly generate a population of cars
    * Evaluate each car
    * Select the best car
    * Repeat with genes of best car
  * Reinforcement Learning
    * Play-and-teach
      * Control the car with keyboard
      * Backpropagate with control input against network output
    * TODO: Deep reinforcement with algorithmic correction
      * Many training loops with algorithms that generate "correct" output for training

## Todo
### UI
* Web workers for training?
* Input validation for forms
  * Ensure network inputs/outputs are anchored to sensor inputs/action counts output
  * Establish better defaults
  * Tooltips or help would be cool
* Save/load specific networks
  * View of all saved models. editable?

### Network
* better system for how rewards/expected values are calculated
* better abstractions for network library
* create better default model that actually works
