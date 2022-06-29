import React from "react";
import RoadCanvas from "./roadCanvas";
import NetworkCanvas from "./networkCanvas";

const VisualView = (props) => {return (
        <div id="mainView">
          <RoadCanvas
            model={props.model}
            env={props.env} />
          <NetworkCanvas 
            model={props.model}
            animTime={props.animTime}
            reset={props.reset} />
        </div>
      )
}

export default VisualView;