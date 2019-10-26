@extends('base.base')

@section('title', 'LaTeXEditor')
@section('description', 'latex.jsを用いたLaTeXのリアルタイムプレビューができるエディター')
@include('base.head')
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.0/ace.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.0/ext-language_tools.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/0.6.0/marked.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.14.2/highlight.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/latex.js@0.11.1/dist/latex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/latex.js@0.11.1/dist/latex.component.js"></script>
@section('content')
<div class="container-fluid">
    <p>左にLaTeXを書くと右にプレビューが表示されます。プレビューができてもpdfへのエクスポートはうまくいかなかったりします。日本語はpdf上では消えます。</p>
    <p>記事はこちら→<a href="https://banatech.tk/blog/11">LaTeX.jsとAce.jsを用いたLaTeXのリアルタイムプレビューができるエディタを作った</a></p>
    <div class="row">
        <div class="col-sm">
            <button type="button" class="btn btn-primary" onclick="saveTex();">Save(.tex)</button>
            <a href="#!" onclick="undo();">
                <i class="fas fa-undo fa-lg fa-fw"></i>
            </a>
            <a href="#!" onclick="redo();">
                <i class="fas fa-redo fa-lg fa-fw"></i>
            </a>
            <div id="editor" style="height: 100vh;"></div>
        </div>
        <div class="col-sm">
            <button type="button" class="btn btn-primary" onclick="exportToPDF();">Export(.pdf)</button>
            <div class="card" style="height: 100vh; overflow: auto;">
                <div class="card-body">
                    <div id="output">
                        <!--LaTeXのパース結果出力場所-->
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        const editor = ace.edit('editor');
        editor.setTheme('ace/theme/monokai');
        editor.setFontSize(14);
        editor.getSession().setMode('ace/mode/latex');
        editor.getSession().setUseWrapMode(true);
        editor.getSession().setTabSize(4);
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });
        editor.getSession().on('change', function () {
            var generator = new latexjs.HtmlGenerator({
                hyphenate: false
            });
            try {
                generator = latexjs.parse(editor.getValue(), {
                    generator: generator
                });
                $("#output").empty();
                output.appendChild(generator.stylesAndScripts(
                    "https://cdn.jsdelivr.net/npm/latex.js@0.11.1/dist/"));
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

        var postForm = function (url, data) {
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
            $form.append('{% csrf_token %}');
            $form.appendTo(document.body);
            $form.submit();
            $("#tempForm").remove();
        };

        function saveTex() {
            var tex = editor.getValue();
            postForm("/LaTeXEditor/saveTex", {
                "tex": tex
            });
        }

        function exportToPDF() {
            var tex = editor.getValue();
            console.log(tex);
            postForm("/LaTeXEditor/exportToPDF", {
                "tex": tex
            });
        }

        function undo() {
            editor.undo();
        }

        function redo() {
            editor.redo();
        }

    </script>
    @endsection
