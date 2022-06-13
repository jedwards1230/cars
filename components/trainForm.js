export class TrainForm {
    constructor() {
        this.numEpisodes = 1000;
        this.numSteps = 10000;
        this.learningRate = 0.001;
        this.epsilonDecay = 0.3;
        this.activeModel = "trainBrain";
    }

    readInputs() {
        this.numEpisodes = parseInt(document.getElementById("episodeCountInput").value);
        this.numSteps = parseInt(document.getElementById("timeLimitInput").value);
        this.learningRate = parseFloat(document.getElementById("learningRateInput").value);
        this.epsilonDecay = parseFloat(document.getElementById("epsilonDecayInput").value);
    }

    setValues() {
        document.getElementById("episodeCountInput").value = this.numEpisodes;
        document.getElementById("timeLimitInput").value = this.numSteps;
        document.getElementById("activeModelName").innerHTML = this.activeModel;
        document.getElementById("epsilonDecayInput").value = this.epsilonDecay;
        document.getElementById("learningRateInput").value = this.learningRate;
    }
}