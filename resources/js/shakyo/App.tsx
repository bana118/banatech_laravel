import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Canvas } from "./Canvas";
import { DownloadLink } from "./DownloadLink";
import { SizeChanger } from "./SizeChanger";

const App: React.FC = () => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>(
        undefined
    );
    const [count, setCount] = useState(1);
    const [size, setSize] = useState(256);
    return (
        <React.Fragment>
            <Canvas size={size} updateCanvas={setCanvas} />
            <p>現在{count}枚目</p>
            <DownloadLink
                canvas={canvas}
                count={count}
                updateCount={setCount}
            />
            <SizeChanger size={size} updateSize={setSize} />
        </React.Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
