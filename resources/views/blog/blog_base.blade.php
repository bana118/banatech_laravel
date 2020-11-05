@extends('base.base')
@section('head')
    @include('base.head')
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="ばなてっく" />
    <meta property="og:description" content="プログラミングやガジェットに関するブログに関する記事一覧" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container uk-container-center uk-background-default">
        <div class="uk-card uk-card-default uk-background-default">
            @yield('card_body')
            <form class="uk-search uk-search-default" method="GET" name="search" action="/blog/search">
                <a href="javascript:document.search.submit()" uk-search-icon></a>
                <input class="uk-search-input" type="search" name="search" placeholder="Search...">
            </form>
            {{ $articles->appends(request()->query())->links('vendor.pagination.uikit-3') }}
            <ul class="uk-list uk-list-divider">
                @foreach ($articles as $article)
                    <li class="list-group">
                        <a href="/blog/view/{{ $article->id }}">{{ $article->title }}</a>
                        <div>
                            @foreach ($article->categories as $category)
                                <button
                                    class="uk-button uk-button-primary uk-button-small uk-border-rounded uk-margin-small-top uk-margin-small-bottom"
                                    onclick="location.href='/blog/category/{{ $category->id }}'">{{ $category->name }}</button>
                            @endforeach
                        </div>
                    </li>
                @endforeach
            </ul>
        </div>
        <a href="/blog/all_categories">すべてのカテゴリ</a>
    </div>
@endsection
