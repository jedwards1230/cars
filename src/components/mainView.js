import { VisualizerComponent } from "./vCanvas.js";
import React from "react";
import WelcomeView from "./welcome.js";
import NavComponent from "./nav.js";
import CanvasComponent from "./canvas.js";
import MTable from "./mTable.js";
import TestForm from "./testForm.js";
import TrainStats from "./trainStats.js";

export class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visualizer: false,
            welcomed: false,
            breakLoop: false,
            numEpisodes: 100,
            episodeCounter: 0,
        }
        this.setTrain = this.setTrain.bind(this)
        this.setPlay = this.setPlay.bind(this)
        this.toggleView = this.toggleView.bind(this);
    }

    setTrain() {
        this.setState({
            welcomed: true,
            visualizer: false,
        })
    }

    setPlay() {
        this.setState({
            welcomed: true,
            visualizer: true,
        })
    }

    toggleView() {
        this.setState({
            visualizer: !this.state.visualizer,
            breakLoop: true,
            episodeCounter: this.state.numEpisodes,
        });
        this.render();
    }

    render() {
        if (!this.state.welcomed) {
            return (
                <div className="mainView">
                    <WelcomeView setTrain={this.setTrain} setPlay={this.setPlay} />
                </div>
            )
        } else if (this.state.visualizer) {
            return (
                <div className="mainView">
                    <NavComponent toggleView={this.toggleView} />
                    <div id="train" className="trainView py-3 container-fluid">
                        <CanvasComponent id="carCanvas" />
                        <VisualizerComponent id="networkCanvas" />
                    </div>
                </div>
            )
        } else {
            return (
                <div className="mainView">
                    <NavComponent  toggleView={this.toggleView} />
                    <div id="train" className="trainView py-3 container-fluid">
                        <CanvasComponent id="carCanvas" />
                        <TestForm />
                        <MTable />
                        <CanvasComponent id="lossChart" />
                        <TrainStats />
                    </div>
                </div>
            )
        }
    }
}