@extends('base.base')

@include('base.head')

@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <div class="uk-card uk-card-default uk-background-default">
        @yield('card_body')
        <form class="uk-search uk-search-default" method="POST" action="/blog/search">
            @csrf
            <span uk-search-icon></span>
            <input class="uk-search-input" type="search" name="search" placeholder="Search...">
        </form>
        {{ $articles->links('vendor.pagination.uikit-3') }}
        <ul class="uk-list uk-list-divider">
            @foreach ($articles as $article)
            <li class="list-group">
                <a href="/blog/view/{{$article->id}}">{{$article->title}}</a>
                <div>
                    @foreach ($article->categories as $category)
                    <button class="uk-button uk-button-primary uk-button-small uk-border-rounded"
                        onclick="location.href='/blog/category/{{$category->name}}'">{{$category->name}}</button>
                    @endforeach
                </div>
            </li>
            @endforeach
        </ul>
    </div>
    <a href="/blog/post">記事追加（管理者用）</a>
</div>
@endsection
