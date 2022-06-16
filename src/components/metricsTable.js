import React from "react";

const MetricsTable = props => {
    const episodes = props.episodes.filter(e => e.goodEntry == true);

    // find min, max, and avg distance of all episodes
    const distanceMap = episodes.map(e => e.distance);
    const distanceMax = Math.max(...distanceMap);
    const distanceMin = Math.min(...distanceMap);
    const distanceAvg = episodes.reduce((a, e) => a + e.distance, 0) / episodes.length;

    // find min, max, and avg time of all episodes
    const timeMap = episodes.map(e => e.time);
    const timeMax = Math.max(...timeMap);
    const timeMin = Math.min(...timeMap);
    const timeAvg = episodes.reduce((a, e) => a + e.time, 0) / episodes.length;

    // find min, max, and avg loss of all episodes
    const lossMap = episodes.map(e => e.loss);
    const lossMax = Math.max(...lossMap);
    const lossMin = Math.min(...lossMap);
    const lossAvg = episodes.reduce((a, e) => a + e.loss, 0) / episodes.length;

    // find min, max, and avg speed of all episodes
    const speedMap = episodes.map(e => e.speed);
    const speedMax = Math.max(...speedMap);
    const speedMin = Math.min(...speedMap);
    const speedAvg = episodes.reduce((a, e) => a + e.speed, 0) / episodes.length;


    return (
        <div className="MTable">
            <h5 className="p-3 text-center">Training Stats</h5>
            <table className="table table-borderless table-hover table-sm text-center align-middle">
                <thead>
                    <tr>
                        <th scope="col">Saved Models</th>
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