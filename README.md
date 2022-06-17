# Miles' Driving School
 
Inspired by [this](https://www.youtube.com/watch?v=Rs_rAxEsAvI).

Requires live server to test due to js modules.

## Model

#### Input: 5
Adjust these in car.js, sensor.js, and network.js
* 5 inputs from its forward rays
  * 0: no obstacles detected
  * 1: collision

#### Output: 2
Adjust these in car.js and network.js
* 0: move forward
* 1: move backward

## Todo
### UI
* Better handling of episodes
  * better storing model history. episodes currently cap at around 1000 stored. way too small. 
* add web worker to handle training
* service worker for offline use
* form for layer composition and other hyperparameters
* compose layers in ui 
  * inputs, outputs, activation 
  * network is created by these params
  * alert if model is different than model in-use
* save/load models by name
* Allow user control of car
  * Save user data as training data

### Network
* optimize how rewards/expected values are calculated
* make it work
