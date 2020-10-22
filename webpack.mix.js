const mix = require("laravel-mix");
const CompressionPlugin = require("compression-webpack-plugin");

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

// base
mix.js("resources/js/base/uikit.js", "public/js/base/")
    .js("resources/js/base/bootstrap.js", "public/js/base/")
    .sass(
        "resources/sass/base/fontawesome.scss",
        "public/css/base/fontawesome.css"
    )
    .sass("resources/sass/base/base.scss", "public/css/base/base.css")
    .less("resources/less/base/uikit.less", "public/css/base/uikit.css");
// .styles(
//     [
//         "public/css/base/sass.css",
//         "public/css/base/less.css",
//         "resources/css/base/app.css",
//     ],
//     "public/css/base/app.css"
// );

// blog
mix.js("resources/js/blog/view.js", "public/js/blog/").sass(
    "resources/sass/blog/view.scss",
    "public/css/blog/view.css"
);

//latex_editor
mix.js("resources/js/latex_editor/editor.js", "public/js/latex_editor/").sass(
    "resources/sass/latex_editor/hilightjs.scss",
    "public/css/latex_editor/hilightjs.css"
);

// kurukuru
mix.js("resources/js/kurukuru/kurukuru.js", "public/js/kurukuru/");

// hakogucha
mix.js("resources/js/hakogucha/hakogucha.js", "public/js/hakogucha/");

// reiwa
mix.js("resources/js/reiwa/reiwa.js", "public/js/reiwa/")
    .js("resources/js/reiwa/solo.js", "public/js/reiwa/")
    .js("resources/js/reiwa/createjs/preloadjs.js", "public/js/reiwa/")
    .js("resources/js/reiwa/createjs/soundjs.js", "public/js/reiwa");
// .scripts(
//     [
//         "resources/js/reiwa/createjs/preloadjs.min.js",
//         "resources/js/reiwa/createjs/soundjs.min.js",
//     ],
//     "public/js/reiwa/createjs.js"
// );

// vr_meiro
mix.js("resources/js/vr_meiro/intro.js", "public/js/vr_meiro/").js(
    "resources/js/vr_meiro/play.js",
    "public/js/vr_meiro/"
);

if (mix.inProduction()) {
    mix.version();
    // gzip compression
    mix.webpackConfig({
        plugins: [
            new CompressionPlugin({
                filename: "[path][base].gz",
                algorithm: "gzip",
                test: /\.(css)|(js)$/,
                minRatio: 1,
                compressionOptions: {
                    level: 9,
                },
            }),
        ],
    });
} else {
    mix.browserSync({
        files: [
            "resources/views/**/*.blade.php",
            "public/**/*.*",
            "routes/*",
            "config/*",
        ],
        proxy: {
            target: "http://127.0.0.1:8000",
        },
    });
}
