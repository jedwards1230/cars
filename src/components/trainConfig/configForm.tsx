import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import SimConfig from "./simConfig";
import NetworkConfig from "./modelConfig";
import { ModelConfig } from "../../network/config";
import { Button, Form, Modal } from "react-bootstrap";

const ConfigForm = (props: {
    show: boolean;
    handleHide: () => void;
    modelConfig: ModelConfig;
}) => {
    const [modelConfig, setModelConfig] = useState(props.modelConfig);

    useEffect(() => {
        setModelConfig(props.modelConfig);
    }, [props.modelConfig]);

    const defaultValues = {
        numEpisodes: 1000,
        numSteps: 2000,
        epsilonDecay: modelConfig.epsilonDecay,
        mutationRate: modelConfig.mutationRate,
        learningRate: modelConfig.lr,
        sensorCount: modelConfig.sensorCount,
        actionCount: modelConfig.actionCount,
        layers: modelConfig.layers
    }

    const methods = useForm({defaultValues})
    const onSubmit = (data: any) => {
        data = cleanData(data);
        console.log(data);
        const config = new ModelConfig("trainBrain", "fsd");
        config.load();

        config.numEpisodes = data.numEpisodes;
        config.numSteps = data.numSteps;
        config.epsilonDecay = data.epsilonDecay;
        config.mutationRate = data.mutationRate;
        config.lr = data.learningRate;
        config.sensorCount = data.sensorCount;
        config.actionCount = data.actionCount;
        config.layers = data.layers;
        config.save();
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
            epsilonDecay: parseFloat(data.epsilonDecay),
            mutationRate: parseFloat(data.mutationRate),
            learningRate: parseFloat(data.learningRate),
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