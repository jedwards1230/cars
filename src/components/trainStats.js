import React, { useContext, useState } from "react";

const TrainProgress = props => {
    const [episodes, setEpisodes] = useState(props.episodes);
    const [goodEntries, setGoodEntries] = useState(0);
    const [badEntries, setBadEntries] = useState(0);

    React.useEffect(() => {
        setEpisodes(props.episodes);
        setGoodEntries(props.episodes.filter(episode => episode.success).length);
        setBadEntries(props.episodes.filter(episode => !episode.success).length);
    }, [props.episodes]);

    
    return (
        <div id="trainStats" className="row py-2 my-2 bg-light">
            <div className="col">

                <div id="goodEntryBar" className="row">
                    <h6 id="survivedCount" className="text-center my-auto col-3">Models Survived: {(goodEntries / episodes.length + 1).toFixed(0)}</h6>
                    <div className="progress col-8 my-auto px-0">
                        <div id="goodEntriesBar" width={((goodEntries / episodes.length) * 100).toFixed(0)} className="progress-bar bg-success" role="progressbar"></div>
                        <div id="badEntriesBar" width={((badEntries / episodes.length) * 100).toFixed(0)} className="progress-bar bg-danger" role="progressbar"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrainProgress;