import React, { useContext } from "react";

const TrainStats = props => {
    const goodEntries = props.episodes.filter((e) => e.goodEntry === true).length;
    const badEntries = props.episodes.filter((e) => e.goodEntry === false).length;
    
    return (
        <div id="trainStats" className="row py-2 my-2 bg-light">
            <div className="col">

                <div id="goodEntryBar" className="row">
                    <h6 id="survivedCount" className="text-center my-auto col-3">Models Survived: {goodEntries / props.episodes.length + 1}</h6>
                    <div className="progress col-8 my-auto px-0">
                        <div id="goodEntriesBar" width={(goodEntries / props.episodes.length) * 100} className="progress-bar bg-success" role="progressbar"></div>
                        <div id="badEntriesBar" width={(badEntries / props.episodes.length) * 100} className="progress-bar bg-danger" role="progressbar"></div>
                    </div>
                </div>

                <table id="tableTrainEntries" className="table table-borderless table-hover table-sm align-middle">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Damaged</th>
                            <th scope="col">Time Steps</th>
                            <th scope="col">Distance</th>
                            <th scope="col">Avg Speed</th>
                            <th scope="col">Avg Loss</th>
                        </tr>
                    </thead>
                    <tbody id="trainTableBody">
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TrainStats;