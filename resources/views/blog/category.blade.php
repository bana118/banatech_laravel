@extends('base.base')
@section('title', 'すべてのカテゴリ')
@section('head')
    @include('base.head')
    <meta property="og:type" content="article" />
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
            <div class="uk-card-body">
                すべてのカテゴリ
                <br>
                <a href="/blog">すべての記事</a>
            </div>
            {{ $categories->links('vendor.pagination.uikit-3') }}
            <ul class="uk-list uk-list-divider">
                @foreach ($categories as $category)
                    <li class="list-group">
                        <a href="/blog/category/{{ $category->id }}">{{ $category->name }}</a>
                    </li>
                @endforeach
            </ul>
        </div>
    </div>
@endsection
