/* eslint no-import-assign: 0 */
/* eslint no-undef: 0 */
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
    MathJax.typeset();
};
