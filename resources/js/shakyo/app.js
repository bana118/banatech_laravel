import React from "react";
import ReactDOM from "react-dom";

function App() {
    return <h1>Hello React!</h1>;
}

const hoge = document.getElementById("app");
console.log(hoge);
if (document.getElementById("app")) {
    console.log("hoge");
    ReactDOM.render(<App />, document.getElementById("app"));
}
