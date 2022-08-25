import { useFormContext } from "react-hook-form";
import styles from "./ConfigForm.module.css";

/** Number of simulations and steps per simulation */
const CarConfig = () => {
    const { register } = useFormContext();
    return (
        <div className={styles.row}>
            <div className={styles.formFloating}>
                <input
                    {...register("activeModel")}
                    type="text"
                    className="form-control"></input>
                <label htmlFor="episodeCountInput">Active Model</label>
            </div>
            <div className={styles.formFloating}>
                <input
                    {...register("alias")}
                    type="text"
                    className="form-control"></input>
                <label htmlFor="timeLimitInput">Alias</label>
            </div>
            <div className={styles.formFloating}>
                <input
                    {...register("sensorCount")}
                    type="number"
                    className="form-control"></input>
                <label htmlFor="sensorCountInput">Sensor Count</label>
            </div>
        </div>
    )
}

export default CarConfig;