import {Chart} from 'chart.js';

class LossChart {
    constructor(ctx) {
        this.chart = this.#newChart(ctx);
    }

    #newChart(chartCtx) {
        return new Chart(chartCtx, {
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
                    tension: 0.2
                }, {
                    type: 'line',
                    label: 'Distance',
                    data: [],
                    parsing: {
                        yAxisKey: 'distance'
                    },
                    fill: false,
                    borderColor: 'rgb(75, 255, 75)',
                    tension: 0.2
                }, {
                    type: 'line',
                    label: 'Time Steps',
                    data: [],
                    parsing: {
                        yAxisKey: 'time'
                    },
                    fill: false,
                    borderColor: 'rgb(75, 75, 75)',
                    tension: 0.2
                }, {
                    type: 'line',
                    label: 'Average Speed',
                    data: [],
                    parsing: {
                        yAxisKey: 'speed'
                    },
                    fill: false,
                    borderColor: 'rgb(75, 75, 255)',
                    tension: 0.2
                }]
            },
            options: {
                normalized: true
            }
        });
    }

    draw(episodes) {
        const d = [];
        const l = [];
        for (let i = 0; i < episodes.length; i++) {
            if (i % 5 === 0) {
                const episodeInfo = episodes[i];
                l.push(i);
                d.push({
                    x: i,
                    loss: episodeInfo.loss,
                    distance: episodeInfo.distance,
                    time: episodeInfo.time,
                    speed: episodeInfo.speed,
                });
            }
        }
        this.chart.data.labels = l;
        this.chart.data.datasets.forEach((dataset) => {
            dataset.data = d;
        });
        this.chart.update();
    }

    show() {
        document.getElementById("lossChart").style.display = "block";
    }

    hide() {
        document.getElementById("lossChart").style.display = "none";
    }

    reset() {
        this.chart.destroy();
        this.chart = this.#newChart();
    }
}

export default LossChart;