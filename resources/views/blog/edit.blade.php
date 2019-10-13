@extends('base.base')

@section('title', 'ばなてっく｜工業大学生のポートフォリオ')
@section('description', '工業大学生によるプログラミングやガジェットに関するブログ兼Webアプリケーション置き場')
@include('base.head')

@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <h1>記事編集</h1>
    <form id="articleEdit" method="POST" action="/blog/edited/{{ $article->id }}" enctype="multipart/form-data">
        <div class="form-group">
            <label for="title">タイトル</label>
            <input type="text" class="form-control" id="title" name="title" value="{{ $article->title }}">
        </div>
        <div class="form-group">
            <label for="category">カテゴリー</label>
            <input type="text" class="form-control" id="category" name="category"
                value="{{ $article->category_split_space }}">
        </div>
        <div class="form-group">
            <label for="content">内容</label>
            <textarea class="form-control" id="content" name="content" rows="30">{{ $content }}</textarea>
        </div>
        <div class="form-group">
            <label for="img">画像</label>
            <input type="file" class="form-control-file" id="image" name="image" multiple="multiple" accept="image/*">
        </div>
        <div class="form-group form-check">
            <input type="radio" name="imgCheck" value="on">画像を変更する
            <input type="radio" name="imgCheck" value="off" checked>画像を変更しない
        </div>
        <button type="submit" class="btn btn-primary">更新</button>
        @csrf
    </form>
</div>
@endsection
