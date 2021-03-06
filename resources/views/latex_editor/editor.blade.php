@extends('base.base')

@section('title', 'LaTeXEditor')
@section('description', 'latex.jsを用いたLaTeXのリアルタイムプレビューができるエディター')
@section('head')
    @include('base.head')
    <script src="{{ mix('js/latex_editor/editor.js') }}"></script>
    <meta name="csrf-token" content='@csrf'>
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="LaTeXEditor" />
    <meta property="og:description" content="latex.jsを用いたLaTeXのリアルタイムプレビューができるエディター" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container uk-background-default">
        <p>左にLaTeXを書くと右にプレビューが表示されます(laravel化のためエクスポート機能は停止中)</p>
        <div class="uk-grid uk-flex-center">
            <div class="uk-width-1-2@m uk-margin-top">
                <a class="uk-button uk-button-primary" href="#!" onclick="saveTex();">Save(.tex)</a>
                <a class="uk-button uk-button-default" href="#!" onclick="undo();">Undo</a>
                <a class="uk-button uk-button-default" href="#!" onclick="redo();">Redo</a>
                <div id="editor" style="height: 100vh;"></div>
            </div>
            <div class="uk-width-1-2@m uk-margin-top">
                <!--<a class="uk-button uk-button-primary" href="#!" onclick="exportToPDF();">Export(.pdf)</a>-->
                <div class="uk-card uk-card-default" style="height: 100vh; overflow: auto;">
                    <div class="uk-card-body">
                        <div id="output">
                            <!--LaTeXのパース結果出力場所-->
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
