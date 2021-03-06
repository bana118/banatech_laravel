#! /usr/bin/env node
// generate HTML article from markdown
/* eslint @typescript-eslint/no-var-requires: 0 */
require("dotenv").config();
const marked = require("marked");
const hljs = require("highlightjs");
const fs = require("fs");
const sizeOf = require("image-size");
const mdArticlesDirPath = `${__dirname}/../public/uploaded/article`;
const htmlArticlesDirPath = `${__dirname}/../resources/views/blog/article`;
const hostname = process.env.APP_URL;
let headerIds = {};

const mdToHtml = (mdText, articleId) => {
    const renderer = new marked.Renderer();
    renderer.code = function (code, language) {
        if (language != null && language.includes(":")) {
            const lang = language.split(":")[0];
            const fileName = language.split(":")[1].trim();
            return `<pre><span class="uk-badge" style="font-size: 14px;">${fileName}</span><code class="hljs">${
                hljs.highlightAuto(code, [lang]).value
            }</code></pre>`;
        } else {
            return `<pre><code class="hljs">${
                hljs.highlightAuto(code, [language]).value
            }</code></pre>`;
        }
    };
    renderer.image = function (href, title, text) {
        const fileName = href.split("/").pop();
        const imageDirUrl = `${hostname}/uploaded/article/${articleId}/image`;
        const imageFilePath = `${mdArticlesDirPath}/${articleId}/image/${fileName}`;
        if (fs.existsSync(imageFilePath)) {
            const imageSize = sizeOf(imageFilePath);
            return `<img data-src="${imageDirUrl}/${fileName}" width="${imageSize.width}" height="${imageSize.height}" alt="${text}" uk-img>`;
        } else {
            return "<p>Not Found</p>";
        }
    };
    renderer.heading = function (text, level, raw, slugger) {
        const regExp =
            /[！＠＃＄％＾＆＊（）＋｜〜＝￥｀「」｛｝；’：”、。・＜＞？【】『』《》〔〕［］‹›«»〘〙〚〛]/g;
        const id = slugger.slug(raw).replace(regExp, "");
        if (id in headerIds) {
            const suffix = headerIds[id];
            const uniqueId = `id-${suffix}`;
            headerIds[id] += 1;
            return `<h${level} id="${uniqueId}">${text}</h${level}>\n`;
        } else {
            headerIds[id] = 1;
            return `<h${level} id="${id}">${text}</h${level}>\n`;
        }
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
    return marked(mdText);
};
const renderMath = async (htmlText, articleId) => {
    const MathJax = await require("mathjax").init({
        loader: { load: ["input/tex", "output/chtml"] },
        chtml: {
            fontURL:
                "https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2",
        },
        tex: {
            inlineMath: [
                ["$", "$"],
                ["\\(", "\\)"],
            ],
            displayMath: [
                ["$$", "$$"],
                ["\\[", "\\]"],
            ],
        },
        startup: {
            document: htmlText,
        },
    });
    const adaptor = MathJax.startup.adaptor;
    const html = MathJax.startup.document;
    if (html.math.toArray().length === 0) {
        adaptor.remove(html.outputJax.chtmlStyles);
    }
    const outputHtml = adaptor.outerHTML(adaptor.root(html.document));
    fs.writeFileSync(`${htmlArticlesDirPath}/${articleId}.html`, outputHtml);
    fs.chmodSync(`${htmlArticlesDirPath}/${articleId}.html`, "666");
};

const argument = process.argv[2];

if (fs.existsSync(mdArticlesDirPath)) {
    if (argument == null) {
        // update all articles
        fs.readdir(mdArticlesDirPath, async (err, articleDirs) => {
            if (err) throw err;
            for (const articleDir of articleDirs) {
                headerIds = {};
                const articleId = Number(articleDir.toString());
                const articlePath = `${mdArticlesDirPath}/${articleId}/${articleId}.md`;
                const mdArticle = fs.readFileSync(articlePath, "utf-8");
                const htmlArticle = mdToHtml(mdArticle, articleId);
                await renderMath(htmlArticle, articleId);
            }
        });
    } else {
        // update specified articles
        const articleId = Number(argument);
        const articlePath = `${mdArticlesDirPath}/${articleId}/${articleId}.md`;
        const mdArticle = fs.readFileSync(articlePath, "utf-8");
        const htmlArticle = mdToHtml(mdArticle, articleId);
        renderMath(htmlArticle, articleId);
    }
}
