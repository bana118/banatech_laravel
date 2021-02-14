@extends('base.base')

@section('title', '記事投稿')
@section('description', '工業大学生による技術ブログ兼アプリケーション置き場')
@section('head')
    @include('base.head')
@endsection

@section('content')
    <div class="uk-container uk-background-default">
        @include('common.errors')
        <form action="/blog/posted" method="POST" enctype="multipart/form-data">
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
                    <div uk-form-custom="target: true">
                        <input type="file" name="mdfile" id="article-mdfile" accept=".md">
                        <input class="uk-input uk-form-width-medium" type="text" placeholder="Select md file" disabled>
                    </div>
                </div>
                <div class="uk-margin">
                    <div uk-form-custom>
                        <input type="file" name="img[]" id="article-img" multiple="multiple" accept="image/*">
                        <button class="uk-button uk-button-default" type="button" tabindex="-1">Image</button>
                    </div>
                </div>

                <div class="uk-margin">
                    <button class="uk-button uk-button-primary">投稿</button>
                </div>
            </fieldset>
        </form>
    </div>
@endsection
