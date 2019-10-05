<?php

Route::get('/blog', function () {
    return view('blog.blog');
});

Route::get('/blog/post', function () {
    return view('blog.post');
});

