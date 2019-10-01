@extends('base.base')

@section('title', 'ばなてっく｜工業大学生のポートフォリオ')
@section('description', '工業大学生によるプログラミングやガジェットに関するブログ兼Webアプリケーション置き場')
@include('base.head')

@section('content')
<div class="container">
    <h1>アプリ一覧</h1>
    <p>Javascript、HTML、Pythonを用いたWebアプリケーション</p>
    <div class="row mb-2">
        <div class="col-md-6">
            <div class="card flex-md-row mb-4 box-shadow h-md-250">
                <div class="card-body d-flex flex-column align-items-start">
                    <h3 class="mb-0">
                        <a class="text-primary" href="/hakogucha">はこぐちゃ</a>
                    </h3>
                    <div class="mb-1 text-muted">2019/6/2</div>
                    <p class="card-text mb-auto">
                        落ちてくる箱を押して色をそろえるゲーム
                    </p>
                </div>
                <img class="card-img-right flex-auto d-none d-md-block" data-src="holder.js/200x250?theme=thumb" alt="Thumbnail [200x250]"
                    style="width: 250px; height: 250px;" src="{{ asset('/img/sumnail/hakogucha.png') }}"
                    data-holder-rendered="true">
            </div>
        </div>
        <div class="col-md-6">
            <div class="card flex-md-row mb-4 box-shadow h-md-300">
                <div class="card-body d-flex flex-column align-items-start">
                    <h3 class="mb-0">
                        <a class="text-primary" href="/reiwa">令和で書き初め</a>
                    </h3>
                    <div class="mb-1 text-muted">2019/5/1</div>
                    <p class="card-text mb-auto">
                        「令和」をひたすら書きまくれ！
                    </p>
                    <a href="https://github.com/bana118/banaTECH/tree/master/banaTECH/reiwa">ソースコード</a>
                </div>
                <img class="card-img-right flex-auto d-none d-md-block" data-src="holder.js/300x300?theme=thumb" alt="Thumbnail [300x300]"
                    style="width: 250px; height: 250px;" src="{{ asset('/img/sumnail/reiwa.png') }}"
                    data-holder-rendered="true">
            </div>
        </div>
    </div>
    <div class="row mb-2">
        <div class="col-md-6">
            <div class="card flex-md-row mb-4 box-shadow h-md-300">
                <div class="card-body d-flex flex-column align-items-start">
                    <h3 class="mb-0">
                        <a class="text-primary" href="/kurukuru">くるくる</a>
                    </h3>
                    <div class="mb-1 text-muted">2019/3/1</div>
                    <p class="card-text mb-auto">
                        ブロックをくるくる回して色を揃えるパズルゲーム
                    </p>
                    <a href="https://github.com/bana118/banaTECH/tree/master/banaTECH/kurukuru">ソースコード</a>
                </div>
                <img class="card-img-right flex-auto d-none d-md-block" data-src="holder.js/300x300?theme=thumb" alt="Thumbnail [300x300]"
                    style="width: 300px; height: 300px;" src="{{ asset('/img/sumnail/kurukuru.png') }}"
                    data-holder-rendered="true">
            </div>
        </div>
        <div class="col-md-6">
            <div class="card flex-md-row mb-4 box-shadow h-md-300">
                <div class="card-body d-flex flex-column align-items-start">
                    <h3 class="mb-0">
                        <a class="text-primary" href="/LaTeXEditor">LaTeXEditor</a>
                    </h3>
                    <div class="mb-1 text-muted">2019/2/18</div>
                    <p class="card-text mb-auto">
                        LaTeX.jsとAce.jsを用いたLaTeXエディタ
                    </p>
                    <a href="https://github.com/bana118/banaTECH/tree/master/banaTECH/LaTeXEditor">ソースコード</a>
                </div>
                <img class="card-img-right flex-auto d-none d-md-block" data-src="holder.js/300x300?theme=thumb" alt="Thumbnail [300x300]"
                    style="width: 300px; height: 300px;" src="{{ asset('/img/sumnail/latex_editor.png') }}"
                    data-holder-rendered="true">
            </div>
        </div>
    </div>
</div>
@endsection
