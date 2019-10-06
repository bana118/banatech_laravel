@extends('base.base')

@include('base.head')

@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <div class="uk-card uk-card-default">
        @yield('card_body')
        <ul class="uk-list uk-list-divider">
            @foreach ($articles as $article)
            <li class="list-group">
                <a href="/blog/{{$article->id}}">{{$article->title}}</a>
                <div>
                    @foreach ($article->categories as $category)
                    <button class="uk-button uk-button-primary uk-button-small uk-border-circle">{{$category->name}}</button>
                    @endforeach
                </div>
            </li>
            @endforeach
        </ul>
    </div>
</div>
@endsection
