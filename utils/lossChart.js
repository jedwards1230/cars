export class LossChart {
    constructor() {
        this.chartCtx = document.getElementById("lossChart").getContext("2d");
        this.chart = this.#newChart();
    }

    #newChart() {
        return new Chart(this.chartCtx, {
            data: {
                labels: [],
                datasets: [{
                    type: 'line',
                    label: 'Loss',
                    data: [],
                    parsing: {
                        yAxisKey: 'loss'
                    },
                    fill: false,
                    borderColor: 'rgb(255, 75, 75)',
                    tension: 0.4
                }, {
                    type: 'line',
                    label: 'Distance',
                    data: [],
                    parsing: {
                        yAxisKey: 'distance'
                    },
                    fill: false,
                    borderColor: 'rgb(75, 255, 75)',
                    tension: 0.6
                }, {
                    type: 'line',
                    label: 'Time Steps',
                    data: [],
                    parsing: {
                        yAxisKey: 'time'
                    },
                    fill: false,
                    borderColor: 'rgb(75, 75, 75)',
                    tension: 0.6
                }, {
                    type: 'line',
                    label: 'Average Speed',
                    data: [],
                    parsing: {
                        yAxisKey: 'speed'
                    },
                    fill: false,
                    borderColor: 'rgb(75, 75, 255)',
                    tension: 0.3
                }]
            }
        });
    }

    updateChart(episodeInfo) {
        const chartEntry = {
            x: episodeInfo.episode,
            loss: episodeInfo.loss,
            distance: episodeInfo.distance,
            time: episodeInfo.time,
            speed: episodeInfo.speed,
        }
        this.pushItem(episodeInfo.episode, chartEntry);
    }

    pushItem(label, data) {
        this.chart.data.labels.push(label);
        this.chart.data.datasets.forEach((dataset) => {
            dataset.data.push(data);
        });
        this.chart.update();
    }

    save() {
        return this.chart.data;
    }

    reset() {
        this.chart.destroy();
        this.chart = this.#newChart();
    }
}