@extends('base.base')

@section('title', '令和で書き初め')
@section('description', '「令和」を100秒以内に書きまくれ！手書き文字を人工知能が判定')
@section('head')
    @include('base.head')
    <script src="{{ mix('js/reiwa/reiwa.js') }}"></script>
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="令和で書き初め" />
    <meta property="og:description" content="「令和」を100秒以内に書きまくれ！手書き文字を人工知能が判定" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container" style="touch-action: manipulation;">
        <div class="uk-frex start" style="position: relative;text-align:center;">
            <img id="penguinImg" src="{{ asset('/img/reiwa/write1.png') }}">
            <div id="bgroup" class="uk-button-group"
                style="display:none; position:absolute;top: 0;left: 0;right: 0;bottom: 0;margin: auto;width:100px;height:100px;">
                <button type="button" class="uk-button uk-button-primary" onclick="location.href='reiwa/solo'">Play</button>
            </div>
            <h4>画像をタッチorクリック！</h4>
        </div>
        <h1>令和で書き初め</h1>
        <p>ルール：100秒以内に「令和」を書きまくれ！マウスか指で書いた文字を人工知能が判定！</p>
        <p>「令」の字は2つありますがどちらでも大丈夫です。</p>
        <p>効果音：<a href="https://maoudamashii.jokersounds.com/">魔王魂</a>様</p>
        <p>BGM：<a href="http://www.rengoku-teien.com/index.html">煉獄庭園</a>様</p>
    </div>
@endsection
