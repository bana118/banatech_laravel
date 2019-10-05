<?php
use Illuminate\Http\Request;
use App\Article;

Route::get('/blog', function () {
    $articles = Article::orderBy('created_at', 'asc')->get();
    
    return view('blog.blog', [
        'articles' => $articles
    ]);
});

Route::get('/blog/post', function () {
    return view('blog.post');
});

Route::post('/blog/posted', function (Request $request) {
    $validator = Validator::make($request->all(), [
        'title' => 'required|max:255',
    ]);

    if ($validator->fails()) {
        return redirect('/blog/post')
            ->withInput()
            ->withErrors($validator);
    }
    $article = new Article();
    $article->title = $request->title;
    $article->save();

    return view('blog.blog');
});

