import "ace-builds";
import "ace-builds/webpack-resolver";
import { parse, HtmlGenerator } from "latex.js";

var editor;
window.onload = function () {
    editor = ace.edit("editor", {
        mode: "ace/mode/latex",
        theme: "ace/theme/monokai",
        fontSize: 18,
    });
    editor.getSession().setUseWrapMode(true);
    editor.getSession().setTabSize(4);
    editor.getSession().on("change", function () {
        var generator = new HtmlGenerator({
            hyphenate: false,
        });
        const outputEl = document.getElementById("output");
        try {
            generator = new parse(editor.getValue(), {
                generator: generator,
            });
            outputEl.textContent = "";
            outputEl.appendChild(
                generator.stylesAndScripts(
                    "https://cdn.jsdelivr.net/npm/latex.js@0.12.1/dist/"
                )
            );
            outputEl.appendChild(generator.domFragment());
        } catch (e) {
            if (e.name == "SyntaxError") {
                /*LaTeXのパースエラー*/
                outputEl.outerHTML =
                    '<div id="output"> <p>' +
                    e.name +
                    "</p><p>line " +
                    e.location["start"]["line"] +
                    " (column " +
                    e.location["start"]["column"] +
                    "): " +
                    e.message +
                    "</p></div>";
                console.error(e);
            } else {
                /*予期せぬエラー*/
                outputEl.outerHTML =
                    '<div id="output"> <p>unexpected error' + "</p></div>";
                console.error(e);
            }
        }
    });
};

function postForm(url, data) {
    const formEl = document.createElement("form");
    formEl.setAttribute("method", "post");
    formEl.setAttribute("action", url);
    for (const key in data) {
        const inputEl = document.createElement("input");
        inputEl.setAttribute("type", "hidden");
        inputEl.setAttribute("name", key);
        inputEl.setAttribute("value", data[key]);
        formEl.appendChild(inputEl);
    }
    const csrfToken = document
        .querySelector("meta[name=csrf-token]")
        .getAttribute("content");
    formEl.insertAdjacentHTML("beforeend", csrfToken);
    document.body.appendChild(formEl);
    formEl.submit();
    formEl.remove();
}

window.saveTex = function () {
    var tex = editor.getValue();
    postForm("/latex_editor/save", {
        tex: tex,
    });
};

/*function exportToPDF() {
    var tex = editor.getValue();
    console.log(tex);
    postForm("/latex_editor/export", {
        "tex": tex
    });
}*/

window.undo = function () {
    editor.undo();
};

window.redo = function () {
    editor.redo();
};
