@extends('base.base')
@section('title', 'VR迷路')
@section('description', 'Webで遊べるVR迷路')
@section('head')
    @include('base.head')
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="VR迷路" />
    <meta property="og:description" content="Webで遊べるVR迷路。ゾンビから逃げろ！" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container uk-background-default" style="touch-action: manipulation;">
        <h1 class="uk-flex uk-flex-center">ゲームオーバー</h1>
        <h2 class="uk-flex uk-flex-center">ゾンビに食べられた...</h2>
        <button type="button" class="uk-button uk-button-primary uk-align-center"
            onclick="location.href='play'">再挑戦</button>
        <div class="uk-margin">
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
            <!-- app-width-responsive -->
            <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3817107084963630"
                data-ad-slot="2386407842" data-ad-format="auto" data-full-width-responsive="true"></ins>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({});

            </script>
        </div>
    </div>
@endsection
