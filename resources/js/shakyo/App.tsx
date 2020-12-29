import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Canvas } from "./Canvas";
import { DownloadLink } from "./DownloadLink";

const App: React.FC = () => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>(
        undefined
    );
    const [count, setCount] = useState(1);
    return (
        <React.Fragment>
            <Canvas width={256} hight={256} updateCanvas={setCanvas} />
            <p>現在{count}枚目</p>
            <DownloadLink canvas={canvas} updateCount={setCount} />
        </React.Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
