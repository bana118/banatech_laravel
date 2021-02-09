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
            <h1>夜に駆ける風画像ジェネレーター</h1>
            <p>好きな画像を夜に駆ける風に変換できるネタアプリです</p>
            <p>原理としてはRGB値を選択した2色の間に線形変換しています</p>
            <p>
                黒，白の値をカラーピッカーで選択することで画像をいろんな色に変換できます
            </p>
            <p>夜に駆ける↓</p>
            <a href="https://www.youtube.com/watch?v=x8VYWazR5mE">
                YOASOBI「夜に駆ける」 Official Music Video - YouTube
            </a>
        </React.Fragment>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
