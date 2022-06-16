import React, { useState } from "react";
import { ProgressBar } from "react-bootstrap";

const TrainProgress = props => {
    const [episodes, setEpisodes] = useState(props.episodes);
    const [goodEntries, setGoodEntries] = useState(0);
    const [badEntries, setBadEntries] = useState(0);

    React.useEffect(() => {
        setEpisodes(props.episodes);
        //const episodes = props.episodes.filter(e => e.goodEntry === true)
        setGoodEntries(props.episodes.filter(e => e.goodEntry === true).length);
        setBadEntries(props.episodes.filter(e => e.goodEntry === false).length);
    }, [props.episodes.length]);


    return (
        <div className="container">
            <div id="goodEntryBar" className="row p-4 m-4">
                <h6 id="survivedCount" className="text-center my-auto col-3">Good/Bad: {goodEntries}/{badEntries}</h6>
                <div className="progress col-8 my-auto px-0">
                    <ProgressBar>
                        <ProgressBar variant="success" now={((goodEntries / episodes.length) * 100)} />
                        <ProgressBar variant="danger" now={((badEntries / episodes.length) * 100).toFixed(0)} />
                    </ProgressBar>
                </div>
            </div>
        </div>
    )
}

export default TrainProgress;