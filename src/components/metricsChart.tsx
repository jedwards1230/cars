import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import React from 'react';

const LossChart = (props: { episodes: any[]; }) => {
    const blank: any[] = [];

    const [chartData, setChartData] = useState(blank);
    const [labels, setLabels] = useState(blank);

    const options = {
        normalized: true,
        responsive: true,
    };

    const data: {
        labels: string[];
        datasets: any[];
    } = {
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

    const draw = (episodes: any[]) => {
        const d: any[] = [];
        const l: number[] = [];
        for (let i = 0; i < episodes.length; i++) {
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
        setChartData(d);
        setLabels(l);
    }

    useEffect(() => {
        draw(props.episodes)
    }, [props.episodes]);

    return (
        <div className='container-fluid'>
            <Chart
                id='lossChart'
                type='line'
                options={options}
                data={data} />
        </div>
    )
}

export default LossChart;