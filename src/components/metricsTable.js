class MetricsTable {
    static update(totalEpisodes) {
        const episodes = totalEpisodes.filter(e => e.goodEntry == true);
        
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

        // update trainStatsTable
        document.getElementById("timeMax").innerHTML = timeMax.toFixed(0);
        document.getElementById("timeMin").innerHTML = timeMin.toFixed(0);
        document.getElementById("timeAvg").innerHTML = timeAvg.toFixed(0);
        document.getElementById("distanceMax").innerHTML = distanceMax.toFixed(0);
        document.getElementById("distanceMin").innerHTML = distanceMin.toFixed(0);
        document.getElementById("distanceAvg").innerHTML = distanceAvg.toFixed(0);
        document.getElementById("lossMax").innerHTML = lossMax.toFixed(4);
        document.getElementById("lossMin").innerHTML = lossMin.toFixed(4);
        document.getElementById("lossAvg").innerHTML = lossAvg.toFixed(4);
        document.getElementById("speedMax").innerHTML = speedMax.toFixed(2);
        document.getElementById("speedMin").innerHTML = speedMin.toFixed(2);
        document.getElementById("speedAvg").innerHTML = speedAvg.toFixed(2);
    }
}

export default MetricsTable;