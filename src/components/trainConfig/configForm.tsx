import React, { useContext } from "react";
import { useForm, FormProvider } from "react-hook-form";
import CarConfig from "./carConfig";
import SimConfig from "./simConfig";
import NetworkConfig from "./modelConfig";
import { AppConfig } from "../../network/config";
import { Button, Form, Modal } from "react-bootstrap";
import { AppContext } from "../../context";

const ConfigForm = (props: {
    show: boolean;
    handleHide: () => void;
}) => {
    const appContext = useContext(AppContext);
    const simConfig = appContext.simConfig;
    const trainConfig = appContext.trainConfig;

    const defaultValues = {
        numEpisodes: trainConfig.numEpisodes,
        numSteps: trainConfig.numSteps,
        smartCarCount: simConfig.brainCount,
        trafficCount: simConfig.trafficCount,
        activeModel: appContext.activeConfig.name,
        alias: appContext.activeConfig.alias,
        epsilonDecay: appContext.activeConfig.epsilonDecay,
        mutationRate: appContext.activeConfig.mutationRate,
        learningRate: appContext.activeConfig.lr,
        sensorCount: appContext.activeConfig.sensorCount,
        actionCount: appContext.activeConfig.actionCount,
        layers: appContext.activeConfig.layers
    }

    const methods = useForm({defaultValues})
    const onSubmit = (data: any) => {
        data = cleanData(data);
        console.log(data);

        appContext.activeModel = data.name;

        const config = new AppConfig(data.name, data.alias);
        trainConfig.numEpisodes = data.numEpisodes;
        trainConfig.numSteps = data.numSteps;
        simConfig.brainCount = data.smartCarCount;
        simConfig.trafficCount = data.trafficCount;
        config.name = data.name;
        config.alias = data.alias;
        config.epsilonDecay = data.epsilonDecay;
        config.mutationRate = data.mutationRate;
        config.lr = data.lr;
        config.sensorCount = data.sensorCount;
        config.actionCount = data.actionCount;
        config.layers = data.layers;
        config.save();

        appContext.activeConfig = config;
        props.handleHide();
    }

    /** clean data to match types of ModelConfig */
    const cleanData = (data: any) => {
        const layers = data.layers.map((layer: any) => {
            return {
                inputs: parseFloat(layer.inputs),
                outputs: parseFloat(layer.outputs),
                activation: layer.activation
            }
        })
        return {
            numEpisodes: parseFloat(data.numEpisodes),
            numSteps: parseFloat(data.numSteps),
            smartCarCount: parseFloat(data.smartCarCount),
            trafficCount: parseFloat(data.trafficCount),
            name: data.activeModel.trim(),
            alias: data.alias.trim(),
            epsilonDecay: parseFloat(data.epsilonDecay),
            mutationRate: parseFloat(data.mutationRate),
            lr: parseFloat(data.learningRate),
            sensorCount: parseInt(data.sensorCount),
            actionCount: parseInt(data.actionCount),
            layers: layers
        }
    }

    return (
        <Modal
            show={props.show}
            onHide={props.handleHide}
            backdrop="static"
            size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormProvider {...methods}>
                    <Form>
                        <h4 className="my-3">Model</h4>
                        <CarConfig />
                        <h4 className="my-3">Simulator</h4>
                        <SimConfig />
                        <h4 className="my-3">Network</h4>
                        <NetworkConfig />
                    </Form>
                </FormProvider>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.handleHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={methods.handleSubmit(onSubmit)}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfigForm