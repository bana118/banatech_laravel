import React, { useState } from "react";
import ReactDOM from "react-dom";
import { DrawableCanvas } from "./DrawableCanvas";
import { DownloadLink } from "./DownloadLink";
import { SizeChanger } from "./SizeChanger";
import { Timer } from "./Timer";

const App: React.FC = () => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>(
        undefined
    );
    const [count, setCount] = useState(1);
    const [canvasSize, setCanvasSize] = useState(256);
    const [lineWidth, setLineWidth] = useState(5);
    return (
        <React.Fragment>
            <DrawableCanvas
                size={canvasSize}
                lineWidth={lineWidth}
                updateCanvas={setCanvas}
            />
            <div className="uk-container">
                <h1>デジタル写経</h1>
                <p>現在{count}枚目</p>
                <DownloadLink
                    canvas={canvas}
                    count={count}
                    updateCount={setCount}
                />
                <SizeChanger
                    propertyName="サイズ"
                    size={canvasSize}
                    updateSize={setCanvasSize}
                    max={1000}
                    min={1}
                />
                <SizeChanger
                    propertyName="線の太さ"
                    size={lineWidth}
                    updateSize={setLineWidth}
                    max={1000}
                    min={1}
                />
                <Timer count={count} />
                <h2>説明</h2>
                <p>
                    キャンバスに書いた文字を保存ボタンでダウンロードすることができます．
                    キャンバスのサイズ，線の太さはそれぞれ1~1000pxで調整可能．
                    タイマー開始で文字を書くのにかかった時間をはかることもでき，タイマー終了でかかった時間の記録をcsv形式で保存できます．
                    手書き文字認識用のデータセット作成にどうぞ．
                </p>
            </div>
        </React.Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
