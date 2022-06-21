# Miles' Driving School
 
Inspired by [this](https://www.youtube.com/watch?v=Rs_rAxEsAvI).

Compiled as a static site with Node.js

## Model

Input: Rays projected from front of the car

Output:
  * 0,1 = forward, backward
  * 2,3 = left, right

Only one action at a time. (toggle this?)

## Todo
### UI
* Add web worker to handle training?
* Input validation for forms
  * Ensure network inputs/outputs are anchored to sensor inputs/action counts output
  * Add input for mutation rate
  * Establish better defaults
  * Tooltips or help would be cool
* Save/load specific networks
  * View of all saved models. editable?
* Allow user control of car
  * Save user data as training data

### Network
* optimize how rewards/expected values are calculated
* make it work
