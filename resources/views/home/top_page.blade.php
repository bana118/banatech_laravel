@extends('base.base')

@section('title', 'ばなてっく｜工業大学生のポートフォリオ')
@section('description', '工業大学生によるプログラミングやガジェットに関するブログ兼Webアプリケーション置き場')
@section('head')
@include('base.head')
@endsection
@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <div class="uk-grid uk-flex-center">
    <div class="uk-width-1-2@m uk-margin-top">
            <a href = "/vr_meiro" class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                    <img src="{{ asset('/img/sumnail/vr_meiro.png') }}" alt="VR迷路" uk-cover>
                    <canvas width="250" height="250"></canvas>
                </div>
                <div>
                    <div class="uk-card-body">
                        <h3 class="uk-card-title">VR迷路</h3>
                        <p>ここに概要を書く</p>
                    </div>
                </div>
            </a>
        </div>
        <div class="uk-width-1-2@m uk-margin-top">
            <a href = "/hakogucha" class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                    <img src="{{ asset('/img/sumnail/hakogucha.png') }}" alt="はこぐちゃ" uk-cover>
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
            <a href = "/reiwa" class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                    <img src="{{ asset('/img/sumnail/reiwa.png') }}" width="250" height="250" alt="令和で書き初め" uk-cover>
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
        <div class="uk-width-1-2@m uk-margin">
            <a href="/kurukuru" class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                    <img src="{{ asset('/img/sumnail/kurukuru.png') }}" alt="くるくる" uk-cover>
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
            <a href="/latex_editor" class="uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s uk-margin uk-link-toggle" uk-grid>
                <div class="uk-flex-last@s uk-card-media-right uk-cover-container">
                    <img src="{{ asset('/img/sumnail/latex_editor.png') }}" alt="LaTeXEditor" uk-cover>
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
