<?php

Route::get('/uikit', function () {
    return view('uikit_sample');
});

Route::get('/', function () {
    return view('home.top_page');
});

Route::get('privacy_policy', function () {
    return view('home.privacy_policy');
});
