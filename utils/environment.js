import {Road} from "../utils/road.js";
import {getRandomInt} from "../utils/utils.js";
import {Car} from "../car/car.js";

export class Environment {
    constructor(trafficCount, brainCount, carCanvas) {
        this.trafficCount = trafficCount;
        this.brainCount = brainCount;

        this.startLane = 2;
        this.driverSpeed = 3;
        this.laneCount = 4;

        this.done = false;

        this.road = new Road(carCanvas.height / 2, carCanvas.height * 0.9, this.laneCount);

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
        const navbarHeight = document.getElementById("nav").offsetHeight;

        // update dimensions
        carCanvas.style.top = navbarHeight + "px";
        carCanvas.width = window.innerWidth;
        networkCanvas.width = window.innerWidth;
    }

    update() {
        for(let i=0; i<this.traffic.length; i++) {
            if(this.traffic[i].model != "fsd") {
                let action = null;
                if(this.traffic[i].sensors.length > 0) {
                    const [observation, metrics] = this.traffic[i].getObservation(this.road.borders, this.traffic);
                    action = this.traffic[i].brain.selectAction(observation);
                }
                this.traffic = this.traffic[i].update(this.traffic, this.road.borders, action);
            }
        }
    }
    
    generateTraffic(N) {
        const cars = [];
        const placed = new Array(this.road.laneCount).fill(100);
    
        for(let i=0; i<N; i++) {
            // randomize lane
            const lane = getRandomInt(0,this.road.laneCount-1);
            const nextLane = placed[lane - 1] ? lane - 1 : lane + 1;
            placed[lane] = placed[lane] + getRandomInt(150, 250);
            const idx = i+this.brainCount;
            const x = placed[lane];
            const y = this.road.getLaneCenter(lane);
            
            let car = new Car(idx, x, y, getRandomInt(2,2), "dummy");
            //let car = new Car(i+this.brainCount, this.road.getLaneCenter(lane), placed[lane], getRandomInt(2,4), "network");
            //car.addBrain("forward", this);
            cars.push(car);
        }
        return cars
    }
}