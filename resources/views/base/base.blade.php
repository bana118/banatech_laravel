<!DOCTYPE html>
<html lang="ja">

<head>
    @yield('head')
</head>

<body>
    <div>
        <div class="uk-offcanvas-content">
            <nav class="uk-navbar-container uk-light" uk-navbar="mode: click">
                <div class="uk-navbar-left nav-overlay">
                    <a class="uk-navbar-item uk-logo" href="/">
                        banaTECH
                    </a>
                </div>
                <div class="uk-navbar-right nav-overlay">
                    <div class="uk-navbar-flip">
                        <ul class="uk-navbar-nav uk-visible@s">
                            <li class="uk-active"><a href="/">製作物</a></li>
                            <li class="uk-active"><a href="/blog">ブログ</a></li>
                            <!--<li class="uk-active"><a href="/profile">プロフィール</a></li>-->
                            <li class="uk-active"><a href="/privacy_policy">プライバシーポリシー</a></li>
                        </ul>
                        <ul class="uk-navbar-nav uk-hidden@s">
                            <li><a class="uk-navbar-toggle" uk-navbar-toggle-icon
                                    uk-toggle="target: #mobile-navbar"></a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div id="mobile-navbar" uk-offcanvas="mode: slide; flip: false">
                <div class="uk-offcanvas-bar">
                    <button class="uk-offcanvas-close" type="button" uk-close></button>
                    <ul class="uk-nav-default uk-nav-parent-icon" uk-nav>
                        <li class="uk-text-center uk-logo" style="padding: 0 0 25px 0;">
                            <a href="/">
                                banaTECH
                            </a>
                        </li>
                        <li>
                            <hr>
                        </li>
                        <li class="uk-text-center">
                            <h3>Menu</h3>
                        </li>
                        <li class="uk-active"><a href="/">製作物</a></li>
                        <li class="uk-active"><a href="/blog">ブログ</a></li>
                        <!--<li class="uk-active"><a href="/profile">プロフィール</a></li>-->
                        <li class="uk-active"><a href="/privacy_policy">プライバシーポリシー</a></li>
                    </ul>
                </div>
            </div>
        </div>
        @yield('content')
        <footer>
            <div id="footer" class="uk-flex uk-flex-column uk-flex-center uk-background-default uk-margin-top">
                <ul class="uk-flex uk-flex-center uk-subnav uk-subnav-divider uk-margin-top">
                    <li><a href="">製作物</a></li>
                    <li><a href="">ブログ</a></li>
                    <li><a href="">プライバシーポリシー</a></li>
                </ul>
                <h3 id="copyright" class="uk-flex uk-flex-center uk-margin-remove">
                    <a class="uk-navbar-item uk-logo" href="/">
                        banaTECH
                    </a>
                </h3>
                <p class="uk-flex uk-flex-center">
                    工業大学生によるプログラミングやガジェットに関するブログ兼アプリケーション置き場
                </p>
                <p id="copyright" class="uk-flex uk-flex-center uk-margin-small">
                    Copyright&copy; banaTECH 2020 All Rights Reserved
                </p>
            </div>
        </footer>
    </div>
</body>

</html>
