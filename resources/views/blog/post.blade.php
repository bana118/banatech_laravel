@extends('base.base')
@section('title', '記事投稿')
@section('description', '工業大学生によるプログラミングやガジェットに関するブログ兼Webアプリケーション置き場')
@include('base.head')

@section('content')
<div class="uk-container uk-container-center uk-background-default">
    @include('common.errors')
    <form action="/blog/posted" method="POST">
        @csrf
        <fieldset class="uk-fieldset">
            <legend class="uk-legend">Post</legend>

            <div class="uk-margin">
                <input class="uk-input" type="text" name="title" id="article-title" placeholder="title">
            </div>
            <div class="uk-margin">
                <input class="uk-input" type="text" name="category" id="article-category" placeholder="category">
            </div>
            <div class="uk-margin">
                <button class="uk-button uk-button-primary">投稿</button>
            </div>
        </fieldset>
    </form>
</div>
@endsection
