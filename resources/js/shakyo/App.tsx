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
    const [canvasSize, setCanvasSize] = useState(256);
    const [lineWidth, setLineWidth] = useState(5);
    return (
        <React.Fragment>
            <Canvas
                size={canvasSize}
                lineWidth={lineWidth}
                updateCanvas={setCanvas}
            />
            <p>現在{count}枚目</p>
            <DownloadLink
                canvas={canvas}
                count={count}
                updateCount={setCount}
            />
            <SizeChanger
                size={canvasSize}
                updateSize={setCanvasSize}
                max={1000}
                min={1}
            />
            <SizeChanger
                size={lineWidth}
                updateSize={setLineWidth}
                max={20}
                min={1}
            />
        </React.Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
