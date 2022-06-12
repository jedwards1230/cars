export class LossChart {
    constructor() {
        this.chartCtx = document.getElementById("lossChart").getContext("2d");
        this.chart = this.#newChart();
        document.getElementById("lossChart").style.display = "none";
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
        const d = new Array(episodes.length);
        const l = new Array(episodes.length);
        for (let i = 0; i < episodes.length; i++) {
            const episodeInfo = episodes[i];
            l[i] = i;
            d[i] = {
                x: i,
                loss: episodeInfo.loss,
                distance: episodeInfo.distance,
                time: episodeInfo.time,
                speed: episodeInfo.speed,
            }
        }
        this.chart.data.labels = l;
        this.chart.data.datasets.forEach((dataset) => {
            dataset.data = d;
        });
        this.chart.update();
        document.getElementById("lossChart").style.display = "block";
    }

    reset() {
        this.chart.destroy();
        this.chart = this.#newChart();
    }
}