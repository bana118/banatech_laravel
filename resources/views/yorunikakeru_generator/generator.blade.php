@extends('base.base')

@section('title', '夜に駆ける風画像ジェネレーター')
@section('description', '好きな画像を夜に駆ける風に変換します')
@section('head')
    @include('base.head')
    <script src="{{ mix('js/yorunikakeru_generator/App.js') }}" defer></script>
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="夜に駆ける風画像ジェネレーター" />
    <meta property="og:description" content="好きな画像を夜に駆ける風に変換します" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container">
        <div id="app" class="uk-background-default uk-padding">
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
