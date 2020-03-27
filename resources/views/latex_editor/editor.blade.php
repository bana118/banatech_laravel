@extends('base.base')

@section('title', 'LaTeXEditor')
@section('description', 'latex.jsを用いたLaTeXのリアルタイムプレビューができるエディター')
@section('head')
@include('base.head')
<script src="{{ mix('js/latex_editor/editor.js') }}"></script>
<meta name="csrf-token" content='@csrf'> <!--to save tex file with post form-->
<meta property="og:url" content="{{ url()->current() }}" />
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="ばなてっく" />
<meta property="og:description" content="LaTeXEditor" />
<meta property="og:image" content="{{ asset('img/sumnail/latex_editor.png')}}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="{{Config::get('const.TWITTERID')}}" />
@endsection
@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <p>左にLaTeXを書くと右にプレビューが表示されます(laravel化のためエクスポート機能は停止中)</p>
    <p>記事はこちら→<a href="/blog/11">LaTeX.jsとAce.jsを用いたLaTeXのリアルタイムプレビューができるエディタを作った</a></p>
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
</div>
@endsection
