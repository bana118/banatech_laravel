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

mix.js('resources/js/app.js', 'public/js')
   .scripts(['node_modules/marked/lib/marked.js',
   'node_modules/highlightjs/highlight.pack.js',], 'public/js/blog.js')
   .scripts(['node_modules/animejs/lib/anime.js',], 'public/js/anime.js')
   .scripts(['node_modules/soundjs/lib/soundjs.js',], 'public/js/soundjs.js')
   .scripts(['node_modules/preloadjs/lib/preloadjs.js',], 'public/js/preload.js')
   .scripts(['node_modules/@tensorflow/tfjs/dist/tf.js'], 'public/js/tf.js')
   .scripts(['node_modules/uikit/dist/js/uikit.js',], 'public/js/uikit.js')
   .sass('resources/sass/app.scss', 'public/css/sass.css')
   .less('resources/less/app.less', 'public/css/less.css')
   .styles([
      'public/css/sass.css',
      'public/css/less.css'
   ], 'public/css/app.css');
   