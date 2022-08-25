import React from "react";
import { useFormContext } from "react-hook-form";
import styles from "./ConfigForm.module.css";

/** Number of simulations and steps per simulation */
const TrainingConfig = () => {
    const { register } = useFormContext();
    return (
        <div className={styles.row}>
            <div className={styles.formFloating}>
                <input
                    {...register("numEpisodes")}
                    type="number"
                    className="form-control"></input>
                <label htmlFor="episodeCountInput">Number of Simulations</label>
            </div>
            <div className={styles.formFloating}>
                <input
                    {...register("numSteps")}
                    type="number"
                    className="form-control"></input>
                <label htmlFor="timeLimitInput">Steps per Simulation</label>
            </div>
            <div className={styles.formFloating}>
                <input
                    {...register("epsilonDecay")}
                    type="text"
                    className="form-control"></input>
                <label htmlFor="epsilonDecayInput">Epsilon Decay Rate</label>
            </div>
            <div className={styles.formFloating}>
                <input
                    {...register("learningRate")}
                    type="text"
                    className="form-control"></input>
                <label htmlFor="learningRateInput">Learning Rate</label>
            </div>
        </div>
    )
}

export default TrainingConfig;