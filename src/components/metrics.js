import React, { useEffect, useState } from "react";

const MetricsTable = props => {
    const [timeMax, setTimeMax] = useState(0);
    const [timeMin, setTimeMin] = useState(0);
    const [timeAvg, setTimeAvg] = useState(0);

    const [distanceMax, setDistanceMax] = useState(0);
    const [distanceMin, setDistanceMin] = useState(0);
    const [distanceAvg, setDistanceAvg] = useState(0);

    const [speedMax, setSpeedMax] = useState(0);
    const [speedMin, setSpeedMin] = useState(0);
    const [speedAvg, setSpeedAvg] = useState(0);

    const [lossMax, setLossMax] = useState(0);
    const [lossMin, setLossMin] = useState(0);
    const [lossAvg, setLossAvg] = useState(0);

    const [modelCount, setModelCount] = useState(0);

    useEffect(() => {
        const episodes = props.episodes
        setModelCount(episodes.length);

        const timeMap = episodes.map(e => e.time);
        setTimeAvg((timeMap.reduce((a, b) => a + b, 0) / episodes.length).toFixed(0));
        setTimeMax(Math.max(...timeMap).toFixed(0));
        setTimeMin(Math.min(...timeMap).toFixed(0));

        const distanceMap = episodes.map(e => e.distance);
        setDistanceAvg((distanceMap.reduce((a, b) => a + b, 0) / episodes.length).toFixed(0));
        setDistanceMin(Math.min(...distanceMap).toFixed(0));
        setDistanceMax(Math.max(...distanceMap).toFixed(0));

        const speedMap = episodes.map(e => e.speed);
        setSpeedAvg((speedMap.reduce((a, b) => a + b, 0) / episodes.length).toFixed(1));
        setSpeedMin(Math.min(...speedMap).toFixed(1));
        setSpeedMax(Math.max(...speedMap).toFixed(1));

        const lossMap = episodes.map(e => e.loss);
        setLossAvg((lossMap.reduce((a, b) => a + b, 0) / episodes.length).toFixed(4));
        setLossMin(Math.min(...lossMap).toFixed(4));
        setLossMax(Math.max(...lossMap).toFixed(4));


    }, [props.episodes]);

    return (
        <div className="metricsTable container">
            <table className="table table-borderless table-hover table-sm text-center align-middle">
                <thead>
                    <tr>
                        <th scope="col">Generation {modelCount} </th>
                        <th scope="col">Min</th>
                        <th scope="col">Average</th>
                        <th scope="col">Max</th>
                    </tr>
                </thead>
                <tbody id="trainStatsTable">
                    <tr>
                        <th scope="row">Time Steps</th>
                        <td id="timeMin">{timeMin}</td>
                        <td id="timeAvg">{timeAvg}</td>
                        <td id="timeMax">{timeMax}</td>
                    </tr>
                    <tr>
                        <th scope="row">Distance</th>
                        <td id="distanceMin">{distanceMin}</td>
                        <td id="distanceAvg">{distanceAvg}</td>
                        <td id="distanceMax">{distanceMax}</td>
                    </tr>
                    <tr>
                        <th scope="row">Loss</th>
                        <td id="lossMin">{lossMin}</td>
                        <td id="lossAvg">{lossAvg}</td>
                        <td id="lossMax">{lossMax}</td>
                    </tr>
                    <tr>
                        <th scope="row">Speed</th>
                        <td id="speedMin">{speedMin}</td>
                        <td id="speedAvg">{speedAvg}</td>
                        <td id="speedMax">{speedMax}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default MetricsTable;