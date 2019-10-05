<?php
use Illuminate\Http\Request;
use App\Article;
use App\Category;

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
        'category' => 'required|max:255',
    ]);

    if ($validator->fails()) {
        return redirect('/blog/post')
            ->withInput()
            ->withErrors($validator);
    }
    $article = new Article();
    $article->title = $request->title;
    $article->save();

    $categorySplitSpace = explode(" ", $request->category);
    foreach($categorySplitSpace as $category){
        $categoryCount = \App\Category::where('name', $category)->count();
        if($categoryCount == 0){
            $newCategory = new Category();
            $newCategory->name = $category;
            $newCategory->save();
            $article->categories()->attach($newCategory->id);
        }else{
            $categoryInDB = \App\Category::where('name', $category)->first();
            $article->categories()->attach(1);
        }
    }

    $articles = Article::orderBy('created_at', 'asc')->get();
    
    return view('blog.blog', [
        'articles' => $articles
    ]);
});

