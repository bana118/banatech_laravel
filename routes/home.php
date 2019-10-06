<?php

Route::get('/', function () {
    return view('home.top_page');
});

Route::get('privacy_policy', function () {
    return view('home.privacy_policy');
});


Route::get('/sample', function () { //TODO for debug
    return view('home.sample');
});
