import 'ace-builds';
import 'ace-builds/webpack-resolver';
import { parse, HtmlGenerator } from 'latex.js'

var editor;
window.onload = function () {
    editor = ace.edit('editor', {
        mode: "ace/mode/latex",
        theme: "ace/theme/monokai",
        fontSize: 18
    });
    editor.getSession().setUseWrapMode(true);
    editor.getSession().setTabSize(4);
    editor.$blockScrolling = Infinity;
    editor.getSession().on('change', function () {
        var generator = new HtmlGenerator({
            hyphenate: false
        });
        try {
            generator = new parse(editor.getValue(), {
                generator: generator
            });
            $("#output").empty();
            output.appendChild(generator.stylesAndScripts(
                "https://cdn.jsdelivr.net/npm/latex.js@0.12.1/dist/"));
            output.appendChild(generator.domFragment());
        } catch (e) {
            if (e.name == "SyntaxError") {
                /*LaTeXのパースエラー*/
                $("#output").replaceWith('<div id="output"> <p>' + e.name + '</p><p>line ' + e.location[
                    "start"]
                ["line"] + ' (column ' + e.location["start"]["column"] + '): ' + e.message +
                    '</p></div>');
                console.error(e);
            } else {
                /*予期せぬエラー*/
                $("#output").replaceWith('<div id="output"> <p>unexpected error' + '</p></div>');
                console.error(e);
            }
        }
    });
}



function postForm(url, data) {
    var $form = $('<form/>', {
        'action': url,
        'method': 'post',
        'id': 'tempForm'
    });
    for (var key in data) {
        $form.append($('<input/>', {
            'type': 'hidden',
            'name': key,
            'value': data[key]
        }));
    }
    var csrfToken = $('meta[name="csrf-token"]').attr('content');
    $form.append(csrfToken);
    $form.appendTo(document.body);
    $form.submit();
    $("#tempForm").remove();
};

window.saveTex = function () {
    var tex = editor.getValue();
    postForm("/latex_editor/save", {
        "tex": tex
    });
}

/*function exportToPDF() {
    var tex = editor.getValue();
    console.log(tex);
    postForm("/latex_editor/export", {
        "tex": tex
    });
}*/

window.undo = function () {
    editor.undo();
}

window.redo = function () {
    editor.redo();
}
