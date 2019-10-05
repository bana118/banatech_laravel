@extends('base.base')

@include('base.head')

@section('content')
<div class="uk-container uk-container-center uk-background-default">
    <div class="uk-card uk-card-default">
        @yield('card_body')
        <ul class="uk-list uk-list-divider">
            <li>List item 1</li>
            <li>List item 2</li>
            <li>List item 3</li>
        </ul>
    </div>
</div>
@endsection
