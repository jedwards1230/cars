# Miles' Driving School

The project began with [this](https://www.youtube.com/watch?v=Rs_rAxEsAvI) tutorial, but I wanted to expand with a network that could teach itself to navigate the traffic, and I wanted it to be configurable from the web page.

Working demo is [here](https://jedwards1230.github.io/cars/)

## Model

Input: 
  * Rays projected from front of the car

Output:
  * 0,1 = forward, backward
  * 2,3 = left, right

Only one action at a time.

## Todo
### UI
* Add web worker to handle training?
* Input validation for forms
  * Ensure network inputs/outputs are anchored to sensor inputs/action counts output
  * Establish better defaults
  * Tooltips or help would be cool
* Save/load specific networks
  * View of all saved models. editable?
* Allow user control of car
  * Save as training data to teach model

### Network
* better system for how rewards/expected values are calculated
* create better default model that actually works
