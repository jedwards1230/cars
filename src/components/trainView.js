class TrainView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visualizer: true,
        }

    }

    render() {
        return (
            <div id="train" className="trainView py-3 container-fluid">
                <CanvasComponent id="carCanvas" />
                {this.state.visualizer ? <CanvasComponent id="networkCanvas" /> : null}
                <TestForm />
                <MTable />
            </div>
        )
    }
}