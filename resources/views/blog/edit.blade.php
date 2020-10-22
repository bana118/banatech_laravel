@extends('base.base')

@section('title', '記事編集')
@section('description', '工業大学生によるプログラミングやガジェットに関するブログ兼Webアプリケーション置き場')
@section('head')
    @include('base.head')
@endsection
@section('content')
    <div class="uk-container uk-container-center uk-background-default">
        @include('common.errors')
        <form id="articleEdit" method="POST" action="/blog/edited/{{ $article->id }}" enctype="multipart/form-data">
            @csrf
            <fieldset class="uk-fieldset">
                <legend class="uk-legend">記事編集</legend>
                <div class="uk-margin">
                    <label for="title">タイトル</label>
                    <input class="uk-input" type="text" placeholder="Title" id="article-title" name="title"
                        value="{{ $article->title }}">
                </div>
                <div class="uk-margin">
                    <label for="category">カテゴリー</label>
                    <input class="uk-input" type="text" placeholder="Category" id="article-category" name="category"
                        value="{{ $article->category_split_space }}">
                </div>
                <div class="uk-margin">
                    <label for="content">内容</label>
                    <textarea class="uk-textarea" rows="30" placeholder="Content" id="article-content"
                        name="content">{{ $content }}</textarea>
                </div>
                <div class="uk-margin">
                    <label for="img">画像</label>
                    <input type="file" name="img[]" id="article-img" multiple="multiple" accept="image/*">
                </div>
                <div class="uk-margin uk-grid-small uk-child-width-auto uk-grid">
                    <label><input class="uk-radio" type="radio" name="imgCheck" value="on">画像を変更する</label>
                    <label><input class="uk-radio" type="radio" name="imgCheck" value="off" checked>画像を変更しない</label>
                </div>
                <div class="uk-margin">
                    <button class="uk-button uk-button-primary">更新</button>
                </div>
            </fieldset>
        </form>
    </div>
@endsection
