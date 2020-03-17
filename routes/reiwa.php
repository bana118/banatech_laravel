<?php

Route::get('/reiwa', function () {
    return view('reiwa.reiwa');
});

Route::get('/reiwa/solo', function () {
    return view('reiwa.solo');
});
