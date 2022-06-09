# Miles' Driving School
 
Inspired by [this](https://www.youtube.com/watch?v=Rs_rAxEsAvI).

Requires live server to test due to js modules.

## Model

#### Input: 6
Adjust these in car.js, sensor.js, and network.js
* speed / acceleration
* 5 inputs from its forward rays
  * 0: no obstacles detected
  * 1: collision

#### Output: 2
Adjust these in car.js and network.js
* 0: move forward
* 1: move backward

## Todo
### UI
* form for hyperparams (lr, decay rate, etc.)
* compose layers in ui 
  * inputs, outputs, activation 
  * network is created by these params
  * alert if model is different than model in-use
* save/load models by name
* animate training loops

### Network
* optimize how rewards/expected values are calculated
* better process for adding layers
  * init with default ins/outs but also read config from ui for flexible building