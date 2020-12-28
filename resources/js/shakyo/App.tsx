import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Canvas } from "./Canvas";
import { DownloadLink } from "./DownloadLink";

const App: React.FC = () => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>(
        undefined
    );
    return (
        <React.Fragment>
            <Canvas width={256} hight={256} updateCanvas={setCanvas} />
            <DownloadLink canvas={canvas} />
        </React.Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
