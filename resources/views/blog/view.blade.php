@extends('base.base')

@section('title', 'ばなてっく｜工業大学生のポートフォリオ')
@section('description', '工業大学生によるプログラミングやガジェットに関するブログ兼Webアプリケーション置き場')
@include('base.head')
<script src="{{ asset('js/blog.js') }}"></script>
<meta property="og:url" content="https://banatech.tk/blog/{{ $article->id }}" />
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="ばなてっく" />
<meta property="og:description" content="{{ $article->title }}" />
<!--<meta property="og:image" content="https://banatech.tk/static/favicon/android-chrome-256x256.png" />-->
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@theoria118" />
<style>
    #title {
        padding: 0.5em;
        /*文字周りの余白*/
        color: #010101;
        /*文字色*/
        background: #eaf3ff;
        /*背景色*/
        border-bottom: solid 3px #516ab6;
        /*下線*/
    }

    #markdown_content h1 {
        font-size: 2em;
        background: linear-gradient(transparent 70%, #a7d6ff 70%);
    }

    h3 { /*TODO change to work only relation article*/
        border-bottom: double 5px #FFC778;
    }

</style>
<script type="text/x-mathjax-config">
    MathJax.Hub.Config({
      extensions: ["tex2jax.js"],
      jax: ["input/TeX", "output/HTML-CSS"],
      tex2jax: {
        inlineMath: [ ['$','$'], ["\\(","\\)"] ],
        displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
        processEscapes: true
      },
      "HTML-CSS": {
        availableFonts: ["TeX"]
      }
    });
</script>
@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <h1 id="title">{{ $article->title }}</h1>
    <h4>{{ $article->updated_at->format('Y年m月d日') }}</h4>
    <p>
        カテゴリー：
        @foreach ($article->categories as $category)
        <button class="uk-button uk-button-primary uk-button-small uk-border-circle">{{$category->name}}</button>
        @endforeach
    </p>
    <div id="markdown_content" src="{{ asset('item/'.$article->md_file) }}"></div>
</div>
<script>
    //数式処理用
    var formula = "";
    var formulaMode = 0;

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
            var imgPath = "{{ asset('/item/article/'.$article->id.'/image') }}"
            return '<img src="'+imgPath+"/"+fileName+'" alt="' + text +
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
                },
                function () {
                    target.append("This content failed to load.");
                }
            );
    });

</script>
@endsection
