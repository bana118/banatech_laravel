@extends('blog.blog_base')

@section('title', '「' . $searchWord . '」の検索結果')
@section('description', 'プログラミングやガジェットに関する技術ブログの「' . $searchWord . '」の検索結果')

@section('card_body')

    <div class="uk-card-body">
        「{{ $searchWord }}」の検索結果
    </div>
@endsection
