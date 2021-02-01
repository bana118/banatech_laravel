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

const convertToHtml = (mdText, articleId) => {
    const renderer = new marked.Renderer();
    renderer.code = function (code, language) {
        if (language.includes(":")) {
            const lang = language.split(":")[0];
            const fileName = language.split(":")[1].trim();
            return `<pre><div class="uk-badge" style="display: inline-block;">${fileName}</div><code class="hljs">${
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
        fs.readdir(mdArticlesDirPath, async function (err, articleDirs) {
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
                fs.chmodSync(`${htmlArticlesDirPath}/${articleId}.html`, "666");
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
        fs.chmodSync(`${htmlArticlesDirPath}/${articleId}.html`, "666");
    }
}
