import React from "react";
import { useFormContext } from "react-hook-form";
import styles from "./ConfigForm.module.css";

/** Number of simulations and steps per simulation */
const SimConfig = () => {
    const { register } = useFormContext();
    return (
        <div className={styles.row}>
            <div className={styles.formFloating}>
                <input
                    {...register("trafficCount")}
                    type="number"
                    className="form-control"></input>
                <label htmlFor="episodeCountInput">Traffic Count</label>
            </div>
            <div className={styles.formFloating}>
                <input
                    {...register("smartCarCount")}
                    type="number"
                    className="form-control"></input>
                <label htmlFor="timeLimitInput">Smart Car Count</label>
            </div>
            <div className={styles.formFloating}>
                <input
                    {...register("mutationAmount")}
                    type="text"
                    className="form-control"></input>
                <label htmlFor="mutationAmountInput">Mutation Amount</label>
            </div>
            <div className={styles.formFloating}>
                <input
                    {...register("mutationRate")}
                    type="text"
                    className="form-control"></input>
                <label htmlFor="mutationRateInput">Mutation Rate</label>
            </div>
        </div>
    )
}

export default SimConfig;