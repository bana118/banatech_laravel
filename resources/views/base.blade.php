<!DOCTYPE html>
<html>
<head>
    @yield('head')
</head>

<body>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark">
        <a class="navbar-brand" href="/">banaTECH</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault"
            aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarsExampleDefault">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item active">
                    <a class="nav-link" href="/">製作物 <span class="sr-only">(current)</span></a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="/blog">ブログ</a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="/privacy_policy">プライバシーポリシー</a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#profile" aria-hidden="true" data-toggle="popover" data-placement="bottom"
                        data-content_div_id="profile_content">
                        プロフィール
                    </a>
                </li>
            </ul>
            <div id="profile_content" style="display:none;">
                <div class="card" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title">ばな</h5>
                        <h6 class="card-subtitle mb-2 text-muted">某工業大学生</h6>
                        <p class="card-text">学んだことをアウトプットする場所が欲しかったのでブログ開設しました。プログラミングや技術系のことを書いていく。</p>
                        <a href="https://twitter.com/bana_tech">
                            <i class="fab fa-twitter fa-lg fa-fw" style="color: white;"></i>
                        </a>
                        <a href="https://github.com/bana118">
                            <i class="fab fa-github fa-lg fa-fw" style="color: white;"></i>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    </nav>
    @yield('content')
    <script>
        $("[data-toggle=popover]").popover({
            html: true,
            container: 'body',
            content: function () {
                var contentDivId = '#' + $(this).data('content_div_id');
                return $(contentDivId).html();
            },
            trigger: 'click',
        });
    </script>
</body>

</html>
