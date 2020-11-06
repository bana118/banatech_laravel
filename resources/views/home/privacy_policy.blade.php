@extends('base.base')

@section('title', 'プライバシーポリシー')
@section('description', 'プライバシーポリシー')
@section('head')
    @include('base.head')
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="ばなてっく" />
    <meta property="og:description" content="プライバシーポリシー" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container uk-container-center uk-background-default">
        <h2>プライバシーポリシー(個人情報保護方針)</h2>
        <p>「{{ config('app.url') }}」（以下、当サイト）を利用される方は、以下に記載する諸条件に同意したものとみなします。</p>
        <p>&nbsp;</p>
        <h2>アクセス解析ツールについて</h2>
        <p>当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。
            このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
            この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。この規約に関して、詳しくは<a
                href="https://policies.google.com/">ポリシーと規約 – Google</a>を参照してください。</p>
        <p>&nbsp;</p>
        <h2>免責事項</h2>
        <p>利用者は、当サイトを閲覧し、その内容を参照した事によって何かしらの損害を被った場合でも、当サイト管理者は責任を負いません。また、当サイトからリンクされた、当サイト以外のウェブサイトの内容やサービスに関して、当サイトの個人情報の保護についての諸条件は適用されません。
            当サイト以外のウェブサイトの内容及び、個人情報の保護に関しても、当サイト管理者は責任を負いません。当サイトで引用している文章や画像、楽曲について、著作権は引用基にあります。万が一、不適切な記事、画像、リンク等がありましたら早急に削除するなどの対応を致しますので、恐れ入りますが下記メールアドレスからご連絡くださるようよろしくお願い致します。
        </p>
        <p>&nbsp;</p>
        <h2>お問い合わせ</h2>
        <p>当サイトの個人情報の取扱などに関するお問い合せは下記までご連絡ください。<br />
            ⇒<a href="mailto:bana.titech@gmail.com">bana.titech@gmail.com</a></p>
    </div>
@endsection
