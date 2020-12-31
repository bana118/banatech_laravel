/* eslint no-import-assign: 0 */
/* eslint no-undef: 0 */
import marked from "marked";
import hljs from "highlightjs";
import MathJax from "mathjax";

MathJax = {
    tex: {
        inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
        ],
        displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"],
        ],
        processEscapes: true,
        macros: {
            ssqrt: ["\\sqrt{\\smash[b]{\\mathstrut #1}}", 1],
            tcdegree: ["\\unicode{xb0}"],
            tccelsius: ["\\unicode{x2103}"],
            tcperthousand: ["\\unicode{x2030}"],
            tcmu: ["\\unicode{x3bc}"],
            tcohm: ["\\unicode{x3a9}"],
        },
    },
    tags: "ams",
    chtml: {
        matchFontHeight: false,
        displayAlign: "left",
        displayIndent: "2em",
    },
};
window.onload = function () {
    const renderer = new marked.Renderer();
    renderer.code = function (code, language) {
        if (language.indexOf(":") != -1) {
            const lang = language.split(":")[0];
            const fileName = language.split(":")[1].trim();
            return (
                "<pre>" +
                '<div class="uk-badge" style="display: inline-block;">' +
                fileName +
                "</div>" +
                '<code class="hljs">' +
                hljs.highlightAuto(code, [lang]).value +
                "</code></pre>"
            );
        } else {
            return (
                "<pre" +
                '><code class="hljs">' +
                hljs.highlightAuto(code).value +
                "</code></pre>"
            );
        }
    };
    renderer.image = function (href, title, text) {
        const fileName = href.split("/").pop();
        const articleIdElement = document.getElementById("article_id");
        const articleId = articleIdElement.dataset.name;
        const imgPath =
            location.origin + "/uploaded/article/" + articleId + "/image";
        return (
            '<img src="' +
            imgPath +
            "/" +
            fileName +
            '" alt="' +
            text +
            '" class="img-fluid">'
        );
    };
    marked.setOptions({
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: false,
        smartypants: false,
    });

    const target = document.getElementById("markdownContent");
    const url = target.getAttribute("src");
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                target.append("This content failed to load.");
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then((data) => {
            target.insertAdjacentHTML("beforeend", marked(data));
            MathJax.typeset();
        })
        .catch(() => {
            target.append("This content failed to load.");
        });
};
