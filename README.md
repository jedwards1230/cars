# cars
 
Inspired by [this](https://www.youtube.com/watch?v=Rs_rAxEsAvI).

## Todo
### UI
* form for hyperparams (lr, decay rate, etc.)
* compose layers in ui 
  * inputs, outputs, activation 
  * network is created by these params
  * alert if model is different than model in-use
* save/load models by name
* animate training loops
* view model metrics while animating (speed, distance)

### Network
* swappable loss functions
* weights decay into null or NaN after a few training loops
  * training basically doesnt work yet
* optimize how rewards/expected values are calculated
* better process for adding layer
  * gotta init with default in/out but also read config from ui for flexible building