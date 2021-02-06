@extends('base.base')

@section('title')
    {{ $article->title }}
@endsection
@section('description')
    {{ $description }}
@endsection
@section('head')
    @include('base.head')
    <link rel="stylesheet" href="{{ mix('/css/blog/view.css') }}">
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="{{ $article->title }}" />
    <meta property="og:description" content="{{ $description }}" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container uk-container-center uk-background-default">
        <h1 class="article-title">{{ $article->title }}</h1>
        <p>作成: {{ $article->created_at->format('Y年m月d日') }}</p>
        <p>更新: {{ $article->updated_at->format('Y年m月d日') }}</p>
        <p>
            カテゴリー：
            @foreach ($article->categories as $category)
                <button
                    class="uk-button uk-button-primary uk-button-small uk-border-rounded uk-margin-small-top uk-margin-small-bottom"
                    onclick="location.href='/blog/category/{{ $category->id }}'">{{ $category->name }}</button>
            @endforeach
        </p>
        <div id="markdownContent" src="{{ asset('uploaded/' . $article->md_file) }}">
            @include('blog.article.' . $article->id)
        </div>
        <h2 class="related-articles-label">関連記事</h2>
        <div class="related-articles">
            @foreach ($relatedArticles as $relatedArticle)
                <div class="uk-margin">
                    <a class="uk-link" href="/blog/view/{{ $relatedArticle->id }}">{{ $relatedArticle->title }}</a>
                </div>
            @endforeach
        </div>
        <span id="article_id" data-name="{{ $article->id }}"></span>
    </div>
@endsection
