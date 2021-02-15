@extends('base.base')

@section('title', 'はこぐちゃ')
@section('description', 'JavaScript、anime.jsを用いたパズルゲーム。ブロックを押したり壊したりして色をそろえよう')
@section('head')
    @include('base.head')
    <script src="{{ mix('js/hakogucha/hakogucha.js') }}"></script>
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="はこぐちゃ" />
    <meta property="og:description" content="JavaScript、anime.jsを用いたパズルゲーム。ブロックを押したり壊したりして色をそろえよう" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container uk-background-default" style="touch-action: manipulation;">
        <div class="uk-container" style="width: 400px;">
            <div class="uk-card uk-card-default">
                <div class="uk-card-body">
                    <div class="uk-grid">
                        <div class="uk-width-1-3">
                            <div class="uk-text-left" id="score">score: </div>
                        </div>
                        <div class="uk-width-1-3">
                            <div class="uk-text-center" id="combo">0 combo </div>
                        </div>
                        <div class="uk-width-1-3">
                            <div class="uk-text-right" id="time">time: </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="blockBox uk-flex uk-flex-center" style="position: relative;">
                @for ($ladder = 0; $ladder < 90; $ladder++)
                    @if ($ladder % 9 == 0) <div class="ladderColumn uk-flex
                    uk-flex-column"> @endif
                    <canvas id="l-{{ $ladder }}" width="40px" height="40px"></canvas>
                    @if ($ladder % 9 == 8)
            </div>
            @endif
            @endfor
            <div class="blocks uk-flex uk-flex-center" style="position: absolute;">
                @for ($ladder = 0; $ladder < 90; $ladder++)
                    @if ($ladder % 9 == 0) <div class="blockColumn uk-flex
                    uk-flex-column"> @endif
                    <canvas id="b-{{ $ladder }}" width="40px" height="40px"></canvas>
                    @if ($ladder % 9 == 8)
            </div>
            @endif
            @endfor
        </div>
        <img id="player" src="" width="40px" height="40px" style="position: absolute; top: 80px; left: 0px;">
        <canvas id="screen" width="400px" height="360px" style="position: absolute;" onClick="gameStart();"></canvas>
    </div>
    <div class="uk-grid">
        <div class="uk-width-1-4 uk-padding-remove"></div>
        <button class="uk-width-1-6 uk-padding-remove btn fas btn-danger fa-angle-up fa-3x fa-fw"
            onClick="buttonUp();"></button>
    </div>
    <div class="uk-grid">
        <div class="uk-width-1-6 uk-padding-remove"></div>
        <button class="uk-width-1-6 uk-padding-remove btn btn-primary fas fa-angle-left fa-3x fa-fw"
            onClick="buttonLeft();"></button>
        <button class="uk-width-1-6 uk-padding-remove btn btn-primary fas fa-angle-right fa-3x fa-fw"
            onClick="buttonRight();"></button>
        <div class="uk-width-1-6 uk-padding-remove"></div>
        <button class="uk-width-1-6 uk-padding-remove btn btn-primary far fa-hand-rock fa-3x fa-fw"
            onClick="buttonPunch();"></button>
    </div>
    <div class="uk-grid">
        <div class="uk-width-1-4 uk-padding-remove"></div>
        <button class="uk-width-1-6 uk-padding-remove btn fas btn-danger fa-angle-down fa-3x fa-fw"
            onClick="buttonDown();"></button>
    </div>
    </div>
    <br>
    <p class="uk-text-center">
        音量調整：
        <input type="range" value="100" id="volume" min="0" max="100" step="1" onchange="setVolume(this.value)">
    </p>
    <p class="uk-text-center">音量：<span id="outputVolume"></span></p>
    <br>
    <h1>ハコグチャ</h1>
    <p>パワプロクンポケット5, 13 ミニゲーム ハコDEグチャ の再現</p>
    <p>ハコを壊したり押したりして降ってくるブロックを避けつつ同じ色のブロックをそろえるゲーム。ゲームオーバー時はクリックすると再スタートできます</p>
    <p>※バグ多数※</p>
    <p>操作方法（キーボード）</p>
    <pre>       wキー：上移動</pre>
    <pre>       aキー：左移動</pre>
    <pre>       sキー：下移動</pre>
    <pre>       dキー：右移動</pre>
    <pre>       エンターキー：向いている方向のブロックを破壊(バツ印は破壊不可、灰色ブロックは3回殴る必要あり)</pre>
    <p>操作方法（ボタン）</p>
    <pre>       上ボタン：上移動</pre>
    <pre>       左ボタン：左移動</pre>
    <pre>       下ボタン：下移動</pre>
    <pre>       右ボタン：右移動</pre>
    <pre>       拳ボタン：向いている方向のブロックを破壊(バツ印は破壊不可、灰色ブロックは3回殴る必要あり)</pre>
    <p>効果音：魔王魂様、効果音ラボ様</p>
    <p>BGM：魔王魂様</p>
    <p>イラスト：友人のkwb様</p>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    <!-- app-width-responsive -->
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3817107084963630" data-ad-slot="2386407842"
        data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>
        (adsbygoogle = window.adsbygoogle || []).push({});

    </script>
    </div>
@endsection
