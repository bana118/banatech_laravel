@extends('blog.blog_base')

@section('title', '「' . $categoryName . '」のカテゴリ検索結果')
@section('description', 'プログラミングやガジェットに関する技術ブログの「' . $categoryName . '」のカテゴリ検索結果')

@section('card_body')

    <div class="uk-card-body">
        「{{ $categoryName }}」のカテゴリ検索結果
        <div>
            <a href="/blog">すべての記事</a>
        </div>
    </div>
@endsection
