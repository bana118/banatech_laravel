<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<meta name="author" content="bana">
<meta name="theme-color" content="#0033FF">
<meta name="description" content="@yield('description')">
<title>
    @yield('title')
</title>
<link rel="stylesheet" href="{{ asset('/css/base/app.css') }}">
<script src="{{ asset('/js/base/app.js') }}"></script>
<style>
    body {
        background-color: #EEEEEE;
        /*ページ全体の背景色*/
    }

    .uk-navbar-container.uk-light:not(.uk-navbar-transparent):not(.uk-navbar-primary) {
        background: #222;
    }

    #mobile-navbar .uk-offcanvas-bar {
        box-shadow: 2px 0 5px 0 #0e0e0e;
    }

    #mobile-navbar li:nth-child(1),
    #mobile-navbar li:nth-child(2),
    #mobile-navbar li:nth-child(3) {
        border-left: unset;
    }

    #mobile-navbar li {
        padding-left: 5px;
        border-left: 2px solid transparent;
    }

    #mobile-navbar li.uk-active {
        padding-left: 5px;
        border-left: 2px solid #545454;
    }
</style>
