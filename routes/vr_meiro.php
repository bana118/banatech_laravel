<?php

use Illuminate\Http\Request;

Route::get('/vr_meiro', function () {
    return view('vr_meiro.intro');
});

Route::get('/vr_meiro/play', function () {
    return view('vr_meiro.play');
});

Route::post('/vr_meiro/game_clear', function (Request $request) {
    $time = $request->input('time');
    
    return view('vr_meiro.game_clear',[
        'time'=>$time
    ]);
});

Route::get('/vr_meiro/game_over', function () {
    return view('vr_meiro.game_over');
});
