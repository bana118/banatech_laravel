@extends('base.base')

@section('title', 'デジタル書道(手書き文字認識用のデータセット作成)')
@section('description', '手書き文字認識のデータセット作成用デジタル書道アプリ．キャンバスに文字をタッチやマウスで書いて保存できます．')
@section('head')
    @include('base.head')
    <script src="{{ mix('js/shodou/App.js') }}" defer></script>
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="デジタル書道(手書き文字認識用のデータセット作成)'" />
    <meta property="og:description" content="手書き文字認識のデータセット作成用デジタル書道アプリ．キャンバスに文字をタッチやマウスで書いて保存できます．" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div id="app" class="uk-background-default">
    </div>
@endsection
