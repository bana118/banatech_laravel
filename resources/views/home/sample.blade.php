<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="utf-8" />
    <title>タイトル</title>
</head>

<body>
    <div id="content">

    </div>
    <script src="{{ asset('/js/marked.js') }}"></script>
    <script>
        window.onload = function () {
            document.getElementById("content").innerHTML = marked("# テスト");
        }
    </script>
</body>

</html>
