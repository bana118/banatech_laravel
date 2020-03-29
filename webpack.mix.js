const mix = require('laravel-mix');

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
mix.js('resources/js/base/app.js', 'public/js/base/')
   .sass('resources/sass/base/app.scss', 'public/css/base/sass.css')
   .less('resources/less/base/app.less', 'public/css/base/less.css')
   .styles([
      'public/css/base/sass.css',
      'public/css/base/less.css',
      'resources/css/base/app.css'
   ], 'public/css/base/app.css');

// blog
mix.js('resources/js/blog/view.js', 'public/js/blog/')
   .styles(['resources/css/blog/view.css'], 'public/css/blog/view.css');

//latex_editor
mix.js('resources/js/latex_editor/editor.js', 'public/js/latex_editor/');

// kurukuru
mix.js('resources/js/kurukuru/kurukuru.js', 'public/js/kurukuru/');

// hakogucha
mix.js('resources/js/hakogucha/hakogucha.js', 'public/js/hakogucha/');

// reiwa
mix.js('resources/js/reiwa/reiwa.js', 'public/js/reiwa/')
   .js('resources/js/reiwa/solo.js', 'public/js/reiwa/')
   .scripts(['resources/js/reiwa/createjs/preloadjs.min.js',
      'resources/js/reiwa/createjs/soundjs.min.js'], 'public/js/reiwa/createjs.js');

if (mix.inProduction()) {
   mix.version();
} else {
   mix.browserSync({
      files: [
         "resources/views/**/*.blade.php",
         "public/**/*.*",
         "routes/*",
         "config/*"
      ],
      proxy: {
         target: "http://127.0.0.1:8000",
      }
   });
}
