<?php

use Illuminate\Http\Request;

Route::get('/latex_editor', function () {
    return view('latex_editor.editor');
});

Route::post('/latex_editor/save', function (Request $request) {
    $filename = 'document.tex';
    $headers = [
        'Content-Type' => 'text/plain',
        'content-Disposition' => 'attachment; filename="' . $filename . '"',
    ];
    $data = $request->input('tex');
    return response()->make($data, 200, $headers);
});
