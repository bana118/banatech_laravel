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
<div class="uk-container uk-container-center uk-background-default">
    <p>左にLaTeXを書くと右にプレビューが表示されます(laravel化のためエクスポート機能は停止中)</p>
    <p>記事はこちら→<a href="/blog/11">LaTeX.jsとAce.jsを用いたLaTeXのリアルタイムプレビューができるエディタを作った</a></p>
    <div class="uk-grid uk-flex-center">
        <div class="uk-width-1-2@m uk-margin-top">
            <a class="uk-button uk-button-primary" href="#!" onclick="saveTex();">Save(.tex)</a>
            <a class="uk-button uk-button-default" href="#!" onclick="undo();">Undo</a>
            <a class="uk-button uk-button-default" href="#!" onclick="redo();">Redo</a>
            <div id="editor" style="height: 100vh;"></div>
        </div>
        <div class="uk-width-1-2@m uk-margin-top">
            <!--<a class="uk-button uk-button-primary" href="#!" onclick="exportToPDF();">Export(.pdf)</a>-->
            <div class="uk-card uk-card-default" style="height: 100vh; overflow: auto;">
                <div class="uk-card-body">
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
            $form.append('@csrf');
            $form.appendTo(document.body);
            $form.submit();
            $("#tempForm").remove();
        };

        function saveTex() {
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

        function undo() {
            editor.undo();
        }

        function redo() {
            editor.redo();
        }

    </script>
    @endsection
