const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 300;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 450;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3);

const trafficCount = 30;
const brainCount = 300;

let traffic = generateCars(brainCount).concat(generateTraffic(trafficCount));
let bestCar = traffic[0];

var mutateDegree = 0.05;

animate();

function reset() {
    traffic = generateCars(brainCount).concat(generateTraffic(trafficCount));
}

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function destroy() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N) {
    const cars = [];
    for(let i=0; i<N; i++) {
        cars.push(new Car(i, road.getLaneCenter(getRandomInt(1,1)), 100, 5, "network", "red"));
        if(i!=0) {
            Network.mutate(cars[i].brain, mutateDegree);
        }
    }
    return cars
}

function generateTraffic(N) {
    const cars = [];
    const placed = [];
    for(let i=0; i<road.laneCount; i++) {
        placed.push(-50);
    }
    for(let i=0; i<N; i++) {
        const lane = getRandomInt(0,road.laneCount-1);
        const nextLane = placed[lane - 1] ? lane - 1 : lane + 1;
        let speed = 0
        if(lane == 0) {
            speed = 2.8;
        } else if(lane == 1) {
            speed = 2.5;
        } else if(lane == 2) {
            speed = 2.7;
        } else if(lane == 3) {
            speed = 3;
        } else if(lane == 4) {
            speed = 2.8;
        }
        placed[lane] = placed[lane] + (placed[nextLane] * 0.3) - getRandomInt(150, 250);
        cars.push(new Car(i+brainCount, road.getLaneCenter(lane), placed[lane], speed));
1    }
    return cars
}

function animate(time) {
    for(let i=0; i<traffic.length; i++) {
        traffic[i].update(road.borders, traffic);
    }

    const te = traffic.filter(
        c=>c.useBrain==true && !c.damaged
    )

    bestCar = te.find(
        c=>c.y==Math.min(
            ...te.map(c=>c.y)
        )
    )

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, carCanvas.height * 0.7 - bestCar.y);
    road.draw(carCtx);
    for(let i=0; i<traffic.length; i++) {
        if(traffic[i].useBrain) {
            carCtx.globalAlpha = 0.2;
        }
        traffic[i].draw(carCtx);
        carCtx.globalAlpha = 1;
    }
    bestCar.draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 40;
    Visualizer.drawNetwork(networkCtx, bestCar.brain)
    requestAnimationFrame(animate);
}