import React, { useContext, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import CarConfig from "./carConfig";
import SimConfig from "./simConfig";
import NetworkConfig from "./networkConfig";
import { AppConfig } from '@jedwards1230/nn.js';
import { Button, Form, Modal } from "react-bootstrap";
import { AppContext } from "../../context";
import TrainingConfig from "./trainingConfig";

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
        mutationAmount: appContext.activeConfig.mutationAmount,
        mutationRate: appContext.activeConfig.mutationRate,
        learningRate: appContext.activeConfig.lr,
        sensorCount: appContext.activeConfig.sensorCount,
        layers: appContext.activeConfig.layers
    }

    const methods = useForm({ defaultValues })
    const onSubmit = (data: any) => {
        data = cleanData(data);
        console.log(data);

        appContext.activeModel = data.name;

        const config = (appContext.activeConfig.name !== data.name
            || appContext.activeConfig.alias !== data.alias)
            ? new AppConfig(data.name, data.alias)
            : appContext.activeConfig;

        trainConfig.numEpisodes = data.numEpisodes;
        trainConfig.numSteps = data.numSteps;
        simConfig.brainCount = data.smartCarCount;
        simConfig.trafficCount = data.trafficCount;
        config.name = data.name;
        config.alias = data.alias;
        config.epsilonDecay = data.epsilonDecay;
        config.mutationAmount = data.mutationAmount;
        config.mutationRate = data.mutationRate;
        config.lr = data.lr;
        config.sensorCount = data.sensorCount;

        if (config.layers.length === data.layers.length) {
            for (let i = 0; i < data.layers.length; i++) {
                const layer = config.layers[i];
                if (layer.outputs === config.layers[i].outputs && layer.inputs === config.layers[i].inputs) {
                    config.layers[i].activation = layer.activation;
                }
            }
        } else {
            config.layers = data.layers;
        }

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
            mutationAmount: parseFloat(data.mutationAmount),
            mutationRate: parseFloat(data.mutationRate),
            lr: parseFloat(data.learningRate),
            sensorCount: parseInt(data.sensorCount),
            layers: layers
        }
    }

    useEffect(() => {
        methods.reset(defaultValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appContext.simConfig.brainCount]);

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
                        <h4 className="my-3">Training</h4>
                        <TrainingConfig />
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