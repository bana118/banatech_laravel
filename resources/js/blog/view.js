import marked from 'marked'
import hljs from 'highlightjs'
import MathJax from 'mathjax'

MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ["\\[", "\\]"]],
        processEscapes: true,
        macros: {
            ssqrt: ['\\sqrt{\\smash[b]{\\mathstrut #1}}', 1],
            tcdegree: ['\\unicode{xb0}'],
            tccelsius: ['\\unicode{x2103}'],
            tcperthousand: ['\\unicode{x2030}'],
            tcmu: ['\\unicode{x3bc}'],
            tcohm: ['\\unicode{x3a9}']
        }
    },
    tags: 'ams',
    chtml: {
        matchFontHeight: false,
        displayAlign: "left",
        displayIndent: "2em"
    }
};
$(document).ready(function () {
    var target = $("#markdown_content");
    var renderer = new marked.Renderer()
    renderer.code = function (code, language) {
        if (language.indexOf(":") != -1) {
            var lang = language.split(":")[0];
            var fileName = language.split(":")[1].trim();
            return '<pre>' +
                '<div class="uk-badge" style="display: inline-block;">' +
                fileName + ' ' + '</div>' + '<code class="hljs">' + hljs.highlightAuto(code, [
                    lang
                ]).value + '</code></pre>';
        } else {
            return '<pre' + '><code class="hljs">' + hljs.highlightAuto(code).value + '</code></pre>';
        }
    };
    renderer.image = function (href, title, text) {
        var fileName = href.split("/").pop();
        var articleId = $("#article_id").data("name");
        var imgPath = location.origin + "/blog_item/article/" + articleId + "/image";
        return '<img src="' + imgPath + "/" + fileName + '" alt="' + text +
            '" class="img-fluid">';
    }

    marked.setOptions({
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: false,
        smartypants: false
    });

    $.ajax({
        url: target[0].attributes["src"].value
    })
        .then(
            function (data) {
                target.append(marked(data));
                MathJax.typeset();
            },
            function () {
                target.append("This content failed to load.");
            }
        );
});
