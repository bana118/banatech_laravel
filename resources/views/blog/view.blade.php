@extends('base.base')

@section('title'){{ $article->title }}@endsection
@section('description'){{ $description }}@endsection
@section('head')
    <link rel="stylesheet" href="{{ mix('/css/blog/view.css') }}">
    @include('base.head')
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="{{ $article->title }}" />
    <meta property="og:description" content="{{ $description }}" />
    <meta property="og:image" content="{{ asset('img/favicon/android-chrome-512x512.png') }}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="{{ Config::get('const.TWITTERID') }}" />
@endsection
@section('content')
    <div class="uk-container uk-container-large uk-padding-remove">
        <div class="uk-flex-center" uk-grid>
            <div class="bt-left-menu uk-visible@l uk-padding">
                <ul class="uk-list uk-margin" uk-sticky="offset: 120">
                    <li class="uk-text-center uk-margin">
                        <a class="uk-link-muted"
                            href="https://twitter.com/share?url={{ url()->current() }}&text={{ $article->title }}"
                            rel="nofollow noopener" target="_blank">
                            <i class="fab fa-2x fa-twitter bt-twitter-link"></i>
                        </a>
                    </li>
                    <li class="uk-text-center uk-margin">
                        <a class="uk-link-muted"
                            href="https://www.facebook.com/sharer/sharer.php?u={{ url()->current() }}"
                            rel="nofollow noopener" target="_blank">
                            <i class="fab fa-2x fa-facebook bt-facebook-link"></i>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="bt-article uk-background-default uk-width-expand uk-padding uk-padding-remove-top uk-margin-left">
                <h1 class="bt-article-title">{{ $article->title }}</h1>
                <p>作成: {{ $article->created_at->format('Y年m月d日') }}</p>
                <p>更新: {{ $article->updated_at->format('Y年m月d日') }}</p>
                <p>
                    @foreach ($article->categories as $category)
                        <button
                            class="uk-button uk-button-primary uk-button-small uk-border-rounded uk-margin-small-top uk-margin-small-bottom"
                            onclick="location.href='/blog/category/{{ $category->id }}'">{{ $category->name }}</button>
                    @endforeach
                </p>
                <div id="markdownContent" src="{{ asset('uploaded/' . $article->md_file) }}">
                    @include('blog.article.' . $article->id)
                </div>
                <ul class="uk-subnav uk-flex uk-flex-right">
                    <li class="uk-text-center uk-margin-top">
                        <a href="https://twitter.com/share?url={{ url()->current() }}&text={{ $article->title }}"
                            rel="nofollow noopener" target="_blank">
                            <i class="fab fa-2x fa-twitter bt-twitter-link"></i>
                        </a>
                    </li>
                    <li class="uk-text-center uk-margin-top">
                        <a href="https://www.facebook.com/sharer/sharer.php?u={{ url()->current() }}"
                            rel="nofollow noopener" target="_blank">
                            <i class="fab fa-2x fa-facebook bt-facebook-link"></i>
                        </a>
                    </li>
                </ul>
                <div class="uk-grid">
                    <div class="uk-width-1-2@m uk-margin-top uk-flex uk-flex-center">
                        <div class="bt-ads-block-300-250">
                            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
                            <!-- blog-display-300x250 -->
                            <ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px"
                                data-ad-client="ca-pub-3817107084963630" data-ad-slot="3482484202"></ins>
                            <script>
                                (adsbygoogle = window.adsbygoogle || []).push({});

                            </script>
                        </div>
                    </div>
                    <div class="uk-width-1-2@m uk-margin-top uk-flex uk-flex-center">
                        <div class="bt-ads-block-300-250">
                            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
                            <!-- blog-display-300x250 -->
                            <ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px"
                                data-ad-client="ca-pub-3817107084963630" data-ad-slot="3482484202"></ins>
                            <script>
                                (adsbygoogle = window.adsbygoogle || []).push({});

                            </script>
                        </div>
                    </div>
                </div>
                <h2 class="bt-related-articles-label">関連記事</h2>
                <div>
                    @foreach ($relatedArticles as $relatedArticle)
                        <div class="uk-margin">
                            <a class="uk-link"
                                href="/blog/view/{{ $relatedArticle->id }}">{{ $relatedArticle->title }}</a>
                        </div>
                    @endforeach
                </div>
                <ul class="uk-subnav uk-flex">
                    <li class="uk-margin-top uk-text-truncate bt-previous-article">
                        @if (isset($previousArticle))
                            <a class="uk-text-truncate"
                                href="/blog/view/{{ $previousArticle->id }}">{{ $previousArticle->title }}</a>
                        @endif
                    </li>
                    <li class="uk-margin-top bt-next-article">
                        @if (isset($nextArticle))
                            <a class="uk-text-truncate"
                                href="/blog/view/{{ $nextArticle->id }}">{{ $nextArticle->title }}</a>
                        @endif
                    </li>
                </ul>
                <span id="article_id" data-name="{{ $article->id }}"></span>
            </div>
            <div class="bt-right-menu uk-visible@m uk-padding">
                <div class="bt-ads-block-300-250">
                    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
                    <!-- blog-display-300x250 -->
                    <ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px"
                        data-ad-client="ca-pub-3817107084963630" data-ad-slot="3482484202"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});

                    </script>
                </div>
                <div class="uk-margin" uk-sticky="offset: 20">
                    <div class="bt-ads-block-300-250">
                        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
                        <!-- blog-display-300x250 -->
                        <ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px"
                            data-ad-client="ca-pub-3817107084963630" data-ad-slot="3482484202"></ins>
                        <script>
                            (adsbygoogle = window.adsbygoogle || []).push({});

                        </script>
                    </div>
                    <div class="bt-toc">
                        <ul class="uk-list uk-list-hyphen uk-list-muted">
                            @foreach ($headersInfo as $headerInfo)
                                <li class="bt-toc-li-{{ $headerInfo[0] }}">
                                    <a class="uk-link-muted uk-text-small" href="#{{ $headerInfo[2] }}"
                                        uk-scroll>{{ $headerInfo[1] }}</a>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
