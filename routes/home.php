<?php

Route::get('/', function () {
    return view('home.top_page');
});

Route::get('privacy_policy', function () {
    return view('home.privacy_policy');
});

Route::group(['prefix' => 'admin'], function () {
    Voyager::routes();
});

/*
Route::get('/sample', function () { //TODO for debug
    return view('home.sample');
});
*/
