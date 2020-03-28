<?php

Route::get('/', function () {
    return view('home.top_page');
});

Route::get('privacy_policy', function () {
    return view('home.privacy_policy');
});

Route::get('/sitemap', 'SiteMapController@sitemap');

Route::group(['prefix' => 'admin'], function () {
    Voyager::routes();
});

