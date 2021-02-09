import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ImagePreviewer } from "./ImagePreviewer";
import { ColorChangeableCanvas } from "./ColorChangeableCanvas";

const App: React.FC = () => {
    const [imageUrl, setImageUrl] = useState("");
    return (
        <React.Fragment>
            <ImagePreviewer imageUrl={imageUrl} setImageUrl={setImageUrl} />
            <ColorChangeableCanvas imageUrl={imageUrl} />
        </React.Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
