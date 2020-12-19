import React from "react";
import ReactDOM from "react-dom";

function App() {
    return <h1>Hello React!</h1>;
}

if (document.getElementById("app")) {
    ReactDOM.render(<App />, document.getElementById("app"));
}
