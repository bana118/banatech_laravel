import React from "react";
import ReactDOM from "react-dom";
import { Canvas } from "./Canvas";

const App: React.FC = () => {
    return <Canvas width={256} hight={256} />;
};

ReactDOM.render(<App />, document.getElementById("app"));
