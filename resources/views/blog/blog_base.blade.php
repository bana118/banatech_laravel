@extends('base.base')

@include('base.head')

@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <div class="uk-card uk-card-default">
        @yield('card_body')
        <ul class="uk-list uk-list-divider">
            @foreach ($articles as $article)
            <li class="list-group">
                <div>{{ $article->title }}</div>
                <div>
                    @foreach ($article->categories as $category)
                        {{ $category->name }}
                    @endforeach
                </div>
            </li>
            @endforeach
        </ul>
    </div>
</div>
@endsection
