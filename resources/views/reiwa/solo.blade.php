@extends('base.base')
@section('title', '令和で書き初め')
@section('description', '「令和」を100秒以内に書きまくれ！手書き文字を人工知能が判定')
@section('head')
    @include('base.head')
    <script src="{{ mix('js/reiwa/solo.js') }}"></script>
    <script src="{{ mix('js/reiwa/preloadjs.min.js') }}"></script>
    <script src="{{ mix('js/reiwa/soundjs.min.js') }}"></script>
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
    <div id="container" class="uk-container" style="touch-action: manipulation;">
        <div class="uk-frex" style="text-align:center;background-color:#CC9966;">
            <div class="uk-grid uk-margin-remove">
                <div id="wrap-can" class="uk-width-2-3 uk-padding-remove" style="position:relative;">
                    <canvas id="can"></canvas>
                </div>
                <div class="uk-width-1-3">
                    <ul class="uk-list uk-list-divider" style="text-align:center;background-color:#FFFFFF;">
                        <li><span id="time">100</span></li>
                        <li>〇:<span id="correctCount">0</span></li>
                        <li>×:<span id="wrongCount">0</span></li>
                    </ul>
                    <img id="write1" src="{{ asset('/img/reiwa/write1.png') }}" class="img-fluid" style="display:none;">
                    <img id="write2" src="{{ asset('/img/reiwa/write2.png') }}" class="img-fluid" style="display:none;">
                    <img id="correct" src="{{ asset('/img/reiwa/correct.png') }}" class="img-fluid" style="display:none;">
                    <img id="wrong" src="{{ asset('/img/reiwa/wrong.png') }}" class="img-fluid" style="display:none;">
                    <button id="submitButton" type="button" class="uk-button-small uk-button-primary"
                        style="display:inline-block;" onClick="submit();">提出</button>
                    <button id="clearButton" type="button" class="uk-button-small uk-button-danger"
                        style="display:inline-block;" onClick="gameClearCan();">クリア</button>
                    <button id="backButton" type="button" class="uk-button-small uk-button-secondary" style="display:none;"
                        onclick="location.href='/reiwa'">戻る</button>
                </div>
            </div>
        </div>
        <div id="finishModal" class="uk-flex-top" uk-modal>
            <div class="uk-modal-dialog uk-margin-auto-vertical">
                <button class="uk-modal-close-default" type="button" uk-close></button>
                <div class="uk-modal-header">
                    <h5 class="uk-modal-title">終了！</h5>
                </div>
                <div id="finalScore" class="uk-modal-body">
                </div>
                <div class="uk-modal-footer uk-text-right">
                    <a id="twitterLink" href="" rel="nofollow" target="_blank">ツイッターでシェア
                        <i class="fab fa-lg fa-twitter"></i>
                    </a>
                </div>
            </div>
        </div>
        <h1>令和で書き初め</h1>
        <p>ルール：100秒以内に「令和」を書きまくれ！マウスか指で書いた文字を人工知能が判定！</p>
        <p>注意：IE, Edgeブラウザでは動作しません。Google Chrome, Opera, Firefox, sleipnirなどを推奨します。「令」の字は2つありますがどちらでも大丈夫です。</p>
        <p>効果音：<a href="https://maoudamashii.jokersounds.com/">魔王魂</a>様</p>
        <p>BGM：<a href="http://www.rengoku-teien.com/index.html">煉獄庭園</a>様</p>
    </div>
@endsection
