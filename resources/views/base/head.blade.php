<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<meta name="author" content="bana">
<meta name="theme-color" content="#0033FF">
<meta name="description" content="@yield('description')">
<title>
    @yield('title')
</title>

<!--Bootstrap CSS-->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
    integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css"
    integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">

<!--Bootstrap JS-->
<script src="https://code.jquery.com/jquery-3.3.1.min.js"
    integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
    integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous">
</script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
    integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous">
</script>
<link rel="stylesheet" href="{{ asset('/css/app.css') }}">
<script src="{{ asset('/js/app.js') }}"></script>
<style>
    body {
        background-color: #EEEEEE;
        /*ページ全体の背景色*/
    }

    .container {
        background-color: white;
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

    .uk-sticky-fixed {
        box-shadow: 0 1px 5px 0 #0e0e0e;
    }

</style>
