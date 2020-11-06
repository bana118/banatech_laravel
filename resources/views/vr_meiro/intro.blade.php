@extends('base.base')
@section('title', 'VR迷路')
@section('description', 'Webで遊べるVR迷路。ゾンビから逃げろ！')
@section('head')
    @include('base.head')
    <script src="{{ mix('js/vr_meiro/intro.js') }}"></script>
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
    <div class="uk-container uk-container-center uk-background-default" style="touch-action: manipulation;">
        <div class="uk-frex start" style="position: relative;text-align:center;">
            <img id="mazeImg" src="{{ asset('img/sumnail/vr_meiro.png') }}" width="400">
            <div id="bgroup" class="uk-button-group"
                style="display:none; position:absolute;top: 0;left: 0;right: 0;bottom: 0;margin: auto;width:100px;height:100px;">
                <button type="button" class="uk-button uk-button-primary"
                    onclick="location.href='vr_meiro/play'">Play</button>
            </div>
            <h4>画像をタッチorクリック！</h4>
        </div>
        <h1>VR迷路</h1>
        <h2>概要</h2>
        <p>赤と青の鍵を集めて扉にたどり着いたらクリア！</p>
        <p>※徘徊するゾンビに注意</p>
        <h2>操作方法(HMD)</h2>
        <p>左ジョイスティック: 移動</p>
        <p>右ジョイスティック: 視点移動</p>
        <p>右下のVRボタンでVRモードに切り替わります。ESCキーでVRモード終了。Oculus Riftで動作確認済み。VRモードはFireFox(ver74.0.1以上)のみで動作確認しました。Google
            Chromeでは動作しません。</p>
        <h2>操作方法(PC)</h2>
        <p>WASDまたは十字キー: 移動</p>
        <p>マウス: 視点移動</p>
        <p>ESCキー: マウスカーソル表示</p>
        <h2>操作方法(スマートフォン)</h2>
        <p>タッチ: 移動</p>
        <p>スワイプ: 視点移動</p>
        <h2>素材</h2>
        <p><a href="https://www.irasutoya.com/2013/02/blog-post_8910.html">かわいいマークのイラスト</a>, <a
                href="https://www.irasutoya.com/2018/08/blog-post_513.html">門のイラスト（西洋）</a>: <a
                href="https://www.irasutoya.com/">かわいいフリー素材集 いらすとや</a></p>
        <p><a href="https://sketchfab.com/3d-models/zombi-model-8a6ba408df1c42ac8a3fc8d07989b2a0">Zombi Model</a>: <a
                href="https://sketchfab.com/cafofo.game.studio">JonatanSantana</a>(<a
                href="https://creativecommons.org/licenses/by/4.0/">Licensed under CC BY 4.0</a>)</p>
    </div>
@endsection
