@extends('base.base')

@section('title', 'ばなてっく｜工業大学生のポートフォリオ')
@section('description', '工業大学生によるプログラミングやガジェットに関するブログ兼Webアプリケーション置き場')
@section('head')
@include('base.head')
<script src="{{ asset('js/blog/view.js') }}"></script>
<script id="MathJax-script" async
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">
</script>
<link rel="stylesheet" href="{{ asset('/css/blog/view.css') }}">
<meta property="og:url" content="https://banatech.tk/blog/{{ $article->id }}" />
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="ばなてっく" />
<meta property="og:description" content="{{ $article->title }}" />
<!--<meta property="og:image" content="https://banatech.tk/static/favicon/android-chrome-256x256.png" />-->
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@theoria118" />
@endsection
@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <h1 id="title">{{ $article->title }}</h1>
    <h4>{{ $article->updated_at->format('Y年m月d日') }}</h4>
    <p>
        カテゴリー：
        @foreach ($article->categories as $category)
        <button class="uk-button uk-button-primary uk-button-small uk-border-rounde">{{$category->name}}</button>
        @endforeach
    </p>
    <div id="markdown_content" src="{{ asset('item/'.$article->md_file) }}"></div>
    <h3 id="related-articles">関連記事</h3>
    @foreach ($relatedArticles as $relatedArticle)
    <a href="/blog/view/{{ $relatedArticle->id }}">{{ $relatedArticle->title }}</a>
    <br>
    @endforeach
    <br>
    <a href="/blog/edit/{{ $article->id }}">記事編集(管理者用)</a>
    <a href="/blog/delete/{{ $article->id }}" onclick="return confirm('本当に削除しますか？')">記事削除(管理者用)</a>
    <span id="article_id" data-name="{{ $article->id }}"></span>
</div>
@endsection
