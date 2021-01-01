#! /usr/bin/env node
// generate HTML article from markdown
/* eslint @typescript-eslint/no-var-requires: 0 */
require("dotenv").config();
const marked = require("marked");
const hljs = require("highlightjs");
const fs = require("fs");
const mdArticlesDirPath = `${__dirname}/../public/uploaded/article`;
const htmlArticlesDirPath = `${__dirname}/../resources/views/blog/article`;
const hostname = process.env.APP_URL;

const convertToHtml = (mdText, articleId) => {
    const renderer = new marked.Renderer();
    renderer.code = function (code, language) {
        if (language.indexOf(":") != -1) {
            const lang = language.split(":")[0];
            const fileName = language.split(":")[1].trim();
            return `<pre><div class="uk-badge" style="display: inline-block;">${fileName}</div><code class="hljs">${
                hljs.highlightAuto(code, [lang]).value
            }</code></pre>`;
        } else {
            return `<pre><code class="hljs">${
                hljs.highlightAuto(code).value
            }</code></pre>`;
        }
    };
    renderer.image = function (href, title, text) {
        const fileName = href.split("/").pop();
        const imgPath = `${hostname}/uploaded/article/${articleId}/image`;
        return `<img data-src="${imgPath}/${fileName}" width="" height="" alt="${text}" uk-img>`;
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

const argument = process.argv[2];

if (fs.existsSync(mdArticlesDirPath)) {
    if (argument == null) {
        // update all articles
        fs.readdir(mdArticlesDirPath, function (err, articleDirs) {
            if (err) throw err;
            for (const articleDir of articleDirs) {
                const articleId = Number(articleDir.toString());
                const articlePath = `${mdArticlesDirPath}/${articleId}/${articleId}.md`;
                const mdArticle = fs.readFileSync(articlePath, "utf-8");
                const htmlArticle = convertToHtml(mdArticle, articleId);
                fs.writeFileSync(
                    `${htmlArticlesDirPath}/${articleId}.html`,
                    htmlArticle
                );
            }
        });
    } else {
        // update specified articles
        const articleId = Number(argument);
        const articlePath = `${mdArticlesDirPath}/${articleId}/${articleId}.md`;
        const mdArticle = fs.readFileSync(articlePath, "utf-8");
        const htmlArticle = convertToHtml(mdArticle, articleId);
        fs.writeFileSync(
            `${htmlArticlesDirPath}/${articleId}.html`,
            htmlArticle
        );
    }
}
