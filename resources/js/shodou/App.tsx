import React, { useState } from "react";
import ReactDOM from "react-dom";
import { DrawableCanvas } from "./DrawableCanvas";
import { DownloadLink } from "./DownloadLink";
import { SizeChanger } from "./SizeChanger";
import { Timer } from "./Timer";
import { ColorChanger } from "./ColorChanger";

const App: React.FC = () => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>(
        undefined
    );
    const [count, setCount] = useState(1);
    const [canvasSize, setCanvasSize] = useState(256);
    const [lineWidth, setLineWidth] = useState(5);
    const [hexLineColor, setHexLineColor] = useState("#000000");
    const [hexCanvasColor, setHexCanvasColor] = useState("#FFFFFF");
    return (
        <React.Fragment>
            <DrawableCanvas
                size={canvasSize}
                lineWidth={lineWidth}
                hexLineColor={hexLineColor}
                hexCanvasColor={hexCanvasColor}
                updateCanvas={setCanvas}
            />
            <div className="uk-container">
                <p>現在{count}枚目</p>
                <DownloadLink
                    canvas={canvas}
                    count={count}
                    updateCount={setCount}
                />
                <Timer count={count} />
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
                <ColorChanger
                    propertyName={"線の色(16進数)"}
                    hexColor={hexLineColor}
                    updateHexColor={setHexLineColor}
                />
                <ColorChanger
                    propertyName={"キャンバスの色(16進数)"}
                    hexColor={hexCanvasColor}
                    updateHexColor={setHexCanvasColor}
                />
                <h1>デジタル書道</h1>
                <p>
                    キャンバスに書いた文字を保存ボタンでダウンロードすることができます．
                </p>
                <p>
                    キャンバスのサイズ，線の太さはそれぞれ1~1000pxで調整可能．
                </p>
                <p>線の色は16進数および，カラーピッカーで調整可能．</p>
                <p>
                    タイマー開始で文字を書くのにかかった時間をはかることもでき，タイマー終了でかかった時間の記録をcsv形式で保存できます．
                </p>
                <p>手書き文字認識用のデータセット作成にどうぞ．</p>
            </div>
        </React.Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
