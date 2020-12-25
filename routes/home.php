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

Route::get('/get-database', function () {
    if (!Auth::check()) {
        return redirect('/admin/login');
    } else {
        return response()->download(database_path() . '/database.sqlite3');
    }
});
