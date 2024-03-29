@extends('base.base')

@section('title', 'くるくる')
@section('description', 'JavaScript、anime.jsを用いたパズルゲーム。ブロックを回転させ同じ色のブロックを4つそろえよう')
@section('head')
    @include('base.head')
    <script src="{{ mix('js/kurukuru/kurukuru.js') }}"></script>
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="くるくる" />
    <meta property="og:description" content="JavaScript、anime.jsを用いたパズルゲーム。ブロックを回転させ同じ色のブロックを4つそろえよう" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container uk-background-default" style="touch-action: manipulation;">
        <div class="uk-container" style="width: 290px;">
            <audio src="" id="startSoundEffect"></audio>
            <audio src="" id="overSoundEffect"></audio>
            <audio src="" id="countDownSoundEffect"></audio>
            <audio src="" id="moveSoundEffect"></audio>
            <audio src="" id="rotateSoundEffect"></audio>
            <audio src="" id="scoreSoundEffect"></audio>
            <audio src="" id="BGM"></audio>
            <div class="uk-card uk-card-default">
                <div class="uk-card-body uk-text-center">
                    <div class="uk-grid uk-flex-center">
                        <div class="uk-width-1-2">
                            <div class="uk-text-left" id="score">score: </div>
                        </div>
                        <div class="uk-width-1-2">
                            <div class="uk-text-right" id="time">time: </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="blockBox uk-flex uk-flex-center" style="position: relative;">
                <canvas id="controller" width="96px" height="96px" style="position: absolute; top:0px; left: 0px;"></canvas>
                @for ($block = 0; $block < 36; $block++)
                    @if ($block % 6 == 0) <div class="blockColumn uk-flex
                    uk-flex-column"> @endif
                    <canvas class="block" style="margin : 4px" id="b-{{ $block }}" width="40px"
                        height="40px"></canvas>
                    @if ($block % 6 == 5)
            </div>
            @endif
            @endfor
            <canvas id="screen" width="290px" height="290px" style="position: absolute; top:0px; left: 0px;"
                onClick="gameStart();"></canvas>
        </div>
        <div class="uk-grid">
            <div class="uk-width-1-6 uk-padding-remove"></div>
            <button class="uk-width-1-4 uk-padding-remove uk-button-danger fas fa-angle-up fa-3x fa-fw"
                onClick="buttonUp();"></button>
        </div>
        <div class="uk-grid">
            <button class="uk-width-1-4 uk-padding-remove uk-button-primary fas fa-angle-left fa-3x fa-fw"
                onClick="buttonLeft();"></button>
            <button class="uk-width-1-4 uk-padding-remove uk-button-primary fas fa-angle-right fa-3x fa-fw"
                onClick="buttonRight();"></button>
            <div class="uk-width-1-6"></div>
            <button class="uk-width-1-6 uk-padding-remove uk-button-secondary fas fa-undo fa-2x fa-fw"
                onClick="buttonCounterClockwise();"></button>
            <button class="uk-width-1-6 uk-padding-remove uk-button-default fas fa-redo fa-2x fa-fw"
                onClick="buttonClockwise();"></button>
        </div>
        <div class="uk-grid">
            <div class="uk-width-1-6"></div>
            <button class="uk-width-1-4 uk-padding-remove uk-button-danger fas fa-angle-down fa-3x fa-fw"
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
    <h1>くるくる</h1>
    <p>パワプロクンポケット7 ミニゲーム くる来るクルくるぅ～ の再現</p>
    <p>ルール：カーソルを操作して同じ色のブロックを4つ正方形に並べよう。連続で消していくとスコアアップ
        スペースキーかゲーム画面クリックで最初の画面からゲームスタートしたりゲームオーバー画面から最初の画面に戻ることができます。</p>
    <p>操作方法（キーボード）</p>
    <pre>       wキー：カーソル上移動</pre>
    <pre>       aキー：カーソル左移動</pre>
    <pre>       sキー：カーソル下移動</pre>
    <pre>       dキー：カーソル右移動</pre>
    <pre>       右キー：カーソル内のブロックを時計回りに回転</pre>
    <pre>       左キー：カーソル内のブロックを反時計回りに回転</pre>
    <p>操作方法（ボタン）</p>
    <pre>       上ボタン：カーソル上移動</pre>
    <pre>       左ボタン：カーソル左移動</pre>
    <pre>       下ボタン：カーソル下移動</pre>
    <pre>       右ボタン：カーソル右移動</pre>
    <pre>       右回りボタン：カーソル内のブロックを時計回りに回転</pre>
    <pre>       左回りボタン：カーソル内のブロックを反時計回りに回転</pre>
    <p>効果音：魔王魂様</p>
    <p>BGM：mozell様</p>
    <div class="uk-margin">
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <!-- app-width-responsive -->
        <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3817107084963630" data-ad-slot="2386407842"
            data-ad-format="auto" data-full-width-responsive="true"></ins>
        <script>
            (adsbygoogle = window.adsbygoogle || []).push({});

        </script>
    </div>
    </div>
@endsection
