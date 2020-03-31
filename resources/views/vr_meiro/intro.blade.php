@extends('base.base')
@section('title', 'VR迷路')
@section('description', 'JavaScript、anime.js、を用いたパズルゲーム。ブロックを回転させ同じ色のブロックを4つそろえよう')
@section('head')
@include('base.head')
<script src="{{ mix('js/vr_meiro/intro.js') }}"></script>
<meta property="og:url" content="{{ url()->current() }}" />
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="ばなてっく" />
<meta property="og:description" content="VR迷路Web" />
<meta property="og:image" content="{{ asset('img/sumnail/kurukuru.png')}}" /><!-- TODO change og image-->
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="{{Config::get('const.TWITTERID')}}" />
@endsection
@section('content')
<div class="uk-container uk-container-center uk-background-default" style="touch-action: manipulation;">
    <div class="uk-frex start" style="position: relative;text-align:center;">
        <img src="{{ asset('/img/reiwa/write1.png') }}" onClick="start();">
        <div id="bgroup" class="uk-button-group" style="display:none; position:absolute;top: 0;left: 0;right: 0;bottom: 0;margin: auto;width:100px;height:100px;">
            <button type="button" class="uk-button uk-button-primary" onclick="location.href='vr_meiro/play'">Play</button>
        </div>
        <h4>画像をタッチorクリック！</h4>
    </div>
    <h1>VR迷路</h1>
    <p>概要</p>
</div>
@endsection