import React, { useState } from "react";
import MetricsTable from "./metricsTable";
import LossChart from "./metricsChart";

import { Simulator } from "../car/simulator";
import RoadCanvas from "./roadCanvas";
import { Button, Container, ProgressBar } from "react-bootstrap";

const TrainView = (props: {
	beginTrain: () => void;
	modelConfig: any;
	sim: Simulator;
	episodeCount: number;
}) => {
	const [started, setStarted] = useState(false);

	const start = () => {
		setStarted(true);
		props.beginTrain();
	}

	return (
		<div>
			<RoadCanvas
				sim={props.sim} />
			<Container>
				<Button
					id="trainBtn"
					variant="success"
					onClick={start}>Start</Button>
				{started && (
					<div>
						<ProgressBar now={props.modelConfig.episodeCounter} max={props.modelConfig.numEpisodes} className="my-2" />
						<MetricsTable episodes={props.modelConfig.generations} />
						<LossChart episodes={props.modelConfig.generations} />
					</div>
				)}
			</Container>

		</div>
	)
}

export default TrainView;