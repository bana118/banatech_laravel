@extends('base.base')

@section('title', '{{ $article->title }}')
@section('description', '工業大学生によるプログラミングやガジェットに関するブログ兼Webアプリケーション置き場')
@section('head')
@include('base.head')
<script src="{{ mix('js/blog/view.js') }}"></script>
<script id="MathJax-script" async
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">
</script>
<link rel="stylesheet" href="{{ mix('/css/blog/view.css') }}">
<meta property="og:url" content="{{ url()->current() }}" />
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="ばなてっく" />
<meta property="og:description" content="{{ $article->title }}" />
<meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png')}}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="{{Config::get('const.TWITTERID')}}" />
@endsection
@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <h1 id="title">{{ $article->title }}</h1>
    <h4>{{ $article->updated_at->format('Y年m月d日') }}</h4>
    <p>
        カテゴリー：
        @foreach ($article->categories as $category)
        <button class="uk-button uk-button-primary uk-button-small uk-border-rounde" onclick="location.href='/blog/category/{{$category->id}}'">{{$category->name}}</button>
        @endforeach
    </p>
    <div id="markdown_content" src="{{ asset('uploaded/'.$article->md_file) }}"></div>
    <h3 id="related-articles">関連記事</h3>
    @foreach ($relatedArticles as $relatedArticle)
    <a href="/blog/view/{{ $relatedArticle->id }}">{{ $relatedArticle->title }}</a>
    <br>
    @endforeach
    <br>
    <span id="article_id" data-name="{{ $article->id }}"></span>
</div>
@endsection
