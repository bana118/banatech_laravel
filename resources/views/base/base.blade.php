<!DOCTYPE html>
<html>

<head>
    @yield('head')
</head>

<body>
    <div>
        <div class="uk-offcanvas-content">
            <!-- menu position. delete .uk-light to change black navbar to white (also you should change logo to dark one)-->
            <nav class="uk-navbar-container uk-light" uk-navbar="mode: click"
                uk-sticky="animation: uk-animation-slide-top; show-on-up: true">
                <!-- logo or title-->
                <div class="uk-navbar-left nav-overlay">
                    <a class="uk-navbar-item uk-logo" href="#">
                        banaTECH
                    </a>
                </div>
                <!-- end logo or title-->
                <!-- menu-->
                <div class="uk-navbar-right nav-overlay">
                    <div class="uk-navbar-flip">
                        <ul class="uk-navbar-nav uk-visible@s">
                            <li class="uk-active"><a href="/">製作物</a></li>
                            <li class="uk-active"><a href="/blog">ブログ</a></li>
                            <li class="uk-active"><a href="/profile">プロフィール</a></li>
                            <li class="uk-active"><a href="/privacy_policy">プライバシーポリシー</a></li>
                        </ul>
                        <ul class="uk-navbar-nav uk-hidden@s">
                            <li><a class="uk-navbar-toggle" uk-navbar-toggle-icon
                                    uk-toggle="target: #mobile-navbar"></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- endmenu-->
            </nav>
            <!-- end menu position-->
            <!-- off-canvas menu-->
            <div id="mobile-navbar" uk-offcanvas="mode: slide; flip: false">
                <div class="uk-offcanvas-bar">
                    <!-- off-canvas close button-->
                    <button class="uk-offcanvas-close" type="button" uk-close></button>
                    <!-- off-canvas close button-->
                    <ul class="uk-nav-default uk-nav-parent-icon" uk-nav>
                        <!-- logo or title-->
                        <li class="uk-text-center uk-logo" style="padding: 0 0 25px 0;">
                            <a href="/">
                                banaTECH
                            </a></li>
                        <!-- end logo or title-->
                        <!-- menu-->
                        <li>
                            <hr>
                        </li>
                        <li class="uk-text-center">
                            <h3>Menu</h3>
                        </li>
                        <li class="uk-active"><a href="/">製作物</a></li>
                        <li class="uk-active"><a href="/blog">ブログ</a></li>
                        <li class="uk-active"><a href="/profile">プロフィール</a></li>
                        <li class="uk-active"><a href="/privacy_policy">プライバシーポリシー</a></li>
                    </ul>
                </div>
            </div>
            <!-- end off-canvas menu-->
        </div>
        @yield('content')
    </div>
</body>

</html>
