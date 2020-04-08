@extends('base.base')
@section('title', 'VR迷路')
@section('description', 'JavaScript、anime.js、を用いたパズルゲーム。ブロックを回転させ同じ色のブロックを4つそろえよう')
@section('head')
@include('base.head')
<meta property="og:url" content="{{ url()->current() }}" />
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="ばなてっく" />
<meta property="og:description" content="VR迷路Web" />
<meta property="og:image" content="{{ asset('img/sumnail/vr_meiro.png')}}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="{{Config::get('const.TWITTERID')}}" />
@endsection
@section('content')
<div class="uk-container uk-container-center uk-background-default" style="touch-action: manipulation;">
    <h1 class="uk-flex uk-flex-center">脱出成功！</h1>
    <h2 class="uk-flex uk-flex-center">クリアタイム: {{ $time }} 秒</h2>
    <button type="button" class="uk-button uk-button-primary uk-position-center" onclick="location.href='play'">再挑戦</button>
</div>
@endsection