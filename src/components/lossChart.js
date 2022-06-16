import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { useState, useEffect } from 'react';

const LossChart = props => {
    const [chartData, setChartData] = useState([]);
    const [labels, setLabels] = useState([]);

    const options = {
        normalized: true,
        responsive: true,
    };

    const data = {
        labels,
        datasets: [{
            type: 'line',
            label: 'Loss',
            data: chartData,
            parsing: {
                yAxisKey: 'loss'
            },
            fill: false,
            borderColor: 'rgb(255, 75, 75)',
            tension: 0.2
        }, {
            type: 'line',
            label: 'Distance',
            data: chartData,
            parsing: {
                yAxisKey: 'distance'
            },
            fill: false,
            borderColor: 'rgb(75, 255, 75)',
            tension: 0.2
        }, {
            type: 'line',
            label: 'Time Steps',
            data: chartData,
            parsing: {
                yAxisKey: 'time'
            },
            fill: false,
            borderColor: 'rgb(75, 75, 75)',
            tension: 0.2
        }, {
            type: 'line',
            label: 'Average Speed',
            data: chartData,
            parsing: {
                yAxisKey: 'speed'
            },
            fill: false,
            borderColor: 'rgb(75, 75, 255)',
            tension: 0.2
        }]
    };

    const draw = (episodes) => {
        const d = [];
        const l = [];
        for (let i = 0; i < episodes.length; i++) {
            const episodeInfo = episodes[i];
            if (episodeInfo.goodEntry) {
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
        setChartData(d);
        setLabels(l);
    }

    useEffect(() => {
        draw(props.episodes)
    }, [props.episodes]);

    return <Chart
        type='line'
        options={options}
        data={data} />
}

export default LossChart;