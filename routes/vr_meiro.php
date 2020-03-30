<?php

Route::get('/vr_meiro', function () {
    return view('vr_meiro.intro');
});

Route::get('/vr_meiro/play', function () {
    return view('vr_meiro.play');
});
