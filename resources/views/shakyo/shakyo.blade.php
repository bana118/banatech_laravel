@extends('base.base')

@section('title', '手書き文字認識用写経')
@section('description', '手書き文字認識のデータセット作成用写経アプリ．手書き文字認識用の手書き文字をタッチやマウスでガンガン書いて保存できます．')
@section('head')
    @include('base.head')
    <script src="{{ mix('js/shakyo/App.js') }}" defer></script>
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="ばなてっく" />
    <meta property="og:description" content="手書き文字認識用写経" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div id="app" style="display: flex;">
    </div>
@endsection
