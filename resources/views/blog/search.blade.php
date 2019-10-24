@extends('blog.blog_base')

@section('title', '記事一覧')
@section('description', 'プログラミングやガジェットに関するブログ')

@section('card_body')

<div class="uk-card-body">
    {{ $searchWord }}：の検索結果
</div>
@endsection
