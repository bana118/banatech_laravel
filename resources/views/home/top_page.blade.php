@extends('base.base')

@section('title', 'ばなてっく｜工業大学生のポートフォリオ')
@section('description', '工業大学生による技術ブログ兼アプリケーション置き場')
@section('head')
    @include('base.head')
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="ばなてっく" />
    <meta property="og:description" content="工業大学生による技術ブログ兼アプリケーション置き場" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container uk-container-center uk-background-default">
        <h1>製作物</h1>
        <div class="uk-grid uk-flex-center">
            <div class="uk-width-1-2@m uk-margin-top">
                <a href="/shodou"
                    class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                    <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                        <img data-src="{{ asset('/img/sumnail/shodou.png') }}" width="250" height="250" alt="shodou"
                            uk-cover uk-img>
                        <canvas width="250" height="250"></canvas>
                    </div>
                    <div>
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">デジタル書道</h3>
                            <p>手書き文字認識のデータセット作成用デジタル書道アプリ</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="uk-width-1-2@m uk-margin-top">
                <a href="https://play.google.com/store/apps/details?id=net.banatech.app.android.sabi_alarm"
                    class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                    <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                        <img data-src="{{ asset('/img/sumnail/sabi_alarm.png') }}" width="250" height="250" alt="sabi_alarm"
                            uk-cover uk-img>
                        <canvas width="250" height="250"></canvas>
                    </div>
                    <div>
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">サビアラーム</h3>
                            <p>アラーム音の再生開始時間を変更できるAndroidアラームアプリ</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="uk-width-1-2@m uk-margin-top">
                <a href="https://chrome.google.com/webstore/detail/github-jupyter-diff-viewe/bhncfkebhcnjhjpagogngbcdbapjdiej?hl=ja"
                    class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                    <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                        <img data-src="{{ asset('/img/sumnail/github_jupyter_diff_viewer.png') }}" width="250" height="250"
                            alt="Github Jupyter diff viewer" uk-cover uk-img>
                        <canvas width="250" height="250"></canvas>
                    </div>
                    <div>
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">Github Jupyter diff viewer</h3>
                            <p>GithubのプルリクエストでJupyterファイルの差分を見やすくする</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="uk-width-1-2@m uk-margin-top">
                <a href="/vr_meiro"
                    class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                    <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                        <img data-src="{{ asset('/img/sumnail/vr_meiro.png') }}" width="250" height="250" alt="VR迷路"
                            uk-cover uk-img>
                        <canvas width="250" height="250"></canvas>
                    </div>
                    <div>
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">VR迷路</h3>
                            <p>VRじゃなくてもできます</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="uk-width-1-2@m uk-margin">
                <a href="/reiwa"
                    class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                    <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                        <img data-src="{{ asset('/img/sumnail/reiwa.png') }}" width="250" height="250" alt="令和で書き初め"
                            uk-cover uk-img>
                        <canvas width="250" height="250"></canvas>
                    </div>
                    <div>
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">令和で書き初め</h3>
                            <p>「令和」をひたすら書きまくる</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="uk-width-1-2@m uk-margin-top">
                <a href="/hakogucha"
                    class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                    <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                        <img data-src="{{ asset('/img/sumnail/hakogucha.png') }}" width="250" height="250" alt="はこぐちゃ"
                            uk-cover uk-img>
                        <canvas width="250" height="250"></canvas>
                    </div>
                    <div>
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">はこぐちゃ</h3>
                            <p>落ちてくる箱を押して色をそろえる</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="uk-width-1-2@m uk-margin">
                <a href="/kurukuru"
                    class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                    <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                        <img data-src="{{ asset('/img/sumnail/kurukuru.png') }}" width="250" height="250" alt="くるくる"
                            uk-cover uk-img>
                        <canvas width="250" height="250"></canvas>
                    </div>
                    <div>
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">くるくる</h3>
                            <p>ブロックをくるくる回して色を揃える</p>
                        </div>
                    </div>
                </a>
            </div>
            <div class="uk-width-1-2@m uk-margin">
                <a href="/latex_editor"
                    class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                    <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                        <img data-src="{{ asset('/img/sumnail/latex_editor.png') }}" width="250" height="250"
                            alt="LaTeXEditor" uk-cover uk-img>
                        <canvas width="250" height="250"></canvas>
                    </div>
                    <div>
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">LaTeXEditor</h3>
                            <p>LaTeX.jsとAce.jsを用いたLaTeXエディタ</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </div>
@endsection
