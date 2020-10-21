@extends('blog.blog_base')

@section('title', '「' . $searchWord . '」の検索結果')
@section('description', 'プログラミングやガジェットに関するブログ')

@section('card_body')

    <div class="uk-card-body">
        「{{ $searchWord }}」の検索結果
    </div>
@endsection
