<?php

Route::get('/react', function () {
    return view('react_sample');
});

Route::get('/', function () {
    return view('home.top_page');
});

Route::get('privacy_policy', function () {
    return view('home.privacy_policy');
});
