import {Road} from "../utils/road.js";
import {getRandomInt} from "../utils/utils.js";
import {Car} from "../car/car.js";

export class Environment {
    constructor(trafficCount, brainCount, carCanvas) {
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;

        this.startLane = 2;
        this.driverSpeed = 3;
        this.laneCount = 3;

        this.done = false;

        this.road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, this.laneCount);

        this.traffic = this.generateTraffic(this.trafficCount);
    }

    reset() {
        this.traffic = this.generateTraffic(this.trafficCount);
    }

    end() {
        let dmgCt = 0;
        let goodCt = 0;
        let goodW = [];
        let badW = [];
        for(let i=0; i<this.traffic.length; i++) {
            if(this.traffic[i].model == 'fsd') {
                if(this.traffic[i].damaged) {
                    dmgCt += 1;
                    console.log(this.traffic[i].brain.layers)
                } else {
                    goodCt += 1;
                }
            }
        }
        console.log("good", goodCt, ", bad", dmgCt);
    }

    render() {
        const carCanvas = document.getElementById("carCanvas");
        const networkCanvas = document.getElementById("networkCanvas");
        const playView = document.getElementById("playView");
        const navbarHeight = document.getElementById("nav").offsetHeight;

        // update dimensions
        playView.style.top = navbarHeight + "px";
        carCanvas.height = window.innerHeight - navbarHeight;
        networkCanvas.height = window.innerHeight - navbarHeight;
    }

    update() {
        for(let i=0; i<this.traffic.length; i++) {
            if(this.traffic[i].model != "fsd") {
                this.traffic[i].update(this.road.borders, this.traffic);
                if(this.traffic[i].sensors.length > 0) {
                    const inputs = this.traffic[i].getSensorData(this.road.borders, this.traffic);
                    const chosen = this.traffic[i].brain.selectAction(observation);
                    if(this.traffic[i].useBrain) {
                        this.traffic[i].updateControls(chosen);
                    }
                }
            }
        }
    }
    
    generateTraffic(N) {
        const cars = [];
        const placed = [];
        for(let i=0; i<this.road.laneCount; i++) {
            placed.push(100);
        }
    
        for(let i=0; i<N; i++) {
            // randomize lane
            const lane = getRandomInt(0,this.road.laneCount-1);
            const nextLane = placed[lane - 1] ? lane - 1 : lane + 1;
            placed[lane] = placed[lane] - getRandomInt(150, 250);
            
            let car = new Car(i+this.brainCount, this.road.getLaneCenter(lane), placed[lane], getRandomInt(2,2), "dummy");
            //let car = new Car(i+this.brainCount, this.road.getLaneCenter(lane), placed[lane], getRandomInt(2,4), "network");
            //car.addBrain("forward", this);
            cars.push(car);
        }
        return cars
    }
}