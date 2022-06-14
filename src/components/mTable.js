const MTable = () => {
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
                        <td id="timeMin"></td>
                        <td id="timeAvg"></td>
                        <td id="timeMax"></td>
                    </tr>
                    <tr>
                        <th scope="row">Distance</th>
                        <td id="distanceMin"></td>
                        <td id="distanceAvg"></td>
                        <td id="distanceMax"></td>
                    </tr>
                    <tr>
                        <th scope="row">Loss</th>
                        <td id="lossMin"></td>
                        <td id="lossAvg"></td>
                        <td id="lossMax"></td>
                    </tr>
                    <tr>
                        <th scope="row">Speed</th>
                        <td id="speedMin"></td>
                        <td id="speedAvg"></td>
                        <td id="speedMax"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default MTable;