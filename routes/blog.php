<?php

use Illuminate\Http\Request;
use App\Article;
use App\Category;

Route::get('/blog', function () {
    $articles = Article::orderBy('updated_at', 'desc')->paginate(config('const.BLOG_SETTING.articles_per_page'));
    return view('blog.blog', [
        'articles' => $articles
    ]);
});

Route::get('/blog/download_all_articles', function () {
    zipDirectory(public_path() . '/uploaded/article/', public_path() . '/articles.zip');
    return response()->download(public_path() . '/articles.zip');
});

function zipDirectory($dir, $file, $root = "")
{
    $zip = new ZipArchive();
    $res = $zip->open($file, ZipArchive::CREATE);

    if ($res) {
        if ($root != "") {
            $zip->addEmptyDir($root);
            $root .= DIRECTORY_SEPARATOR;
        }

        $baseLen = mb_strlen($dir);

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(
                $dir,
                FilesystemIterator::SKIP_DOTS
                    | FilesystemIterator::KEY_AS_PATHNAME
                    | FilesystemIterator::CURRENT_AS_FILEINFO
            ),
            RecursiveIteratorIterator::SELF_FIRST
        );

        $list = array();
        foreach ($iterator as $pathname => $info) {
            $localpath = $root . mb_substr($pathname, $baseLen);

            if ($info->isFile()) {
                $zip->addFile($pathname, $localpath);
            } else {
                $res = $zip->addEmptyDir($localpath);
            }
        }

        $zip->close();
    } else {
        return false;
    }
}

Route::get('/blog/all_categories', function () {
    $allCategories = Category::orderBy('name', 'asc')->paginate(config('const.BLOG_SETTING.categories_per_page'));
    return view('blog.category', [
        'categories' => $allCategories
    ]);
});

Route::get('/blog/view/{articleId}', function ($articleId) {
    $articleCount = \App\Article::where('id', $articleId)->count();
    if ($articleCount == 0) {
        return App::abort(404);
    } else {
        $article = \App\Article::where('id', $articleId)->first();
        $relatedArticleIdList = array();
        $categories = $article->categories()->get();
        foreach ($categories as $category) {
            $categoryArticles = $category->articles()->get();
            foreach ($categoryArticles as $categoryArticle) {
                if (!in_array($categoryArticle->id, $relatedArticleIdList) && $categoryArticle->id != $articleId) {
                    $relatedArticleIdList[] = $categoryArticle->id;
                }
            }
        }
        $relatedArticles = Article::whereIn('id', $relatedArticleIdList)->orderBy('updated_at', 'desc')->take(3)->get();
        return view('blog.view', [
            'article' => $article,
            'relatedArticles' => $relatedArticles
        ]);
    }
});

Route::get('/blog/delete/{articleId}', function ($articleId) {
    if (Auth::check()) {
        $article = \App\Article::where('id', $articleId)->first();
        $deleteDirPath = "uploaded/article/" . $article->id;
        File::deleteDirectory(public_path($deleteDirPath));
        $article->delete();
        return redirect('/blog');
    } else {
        return redirect('/admin/login');
    }
});

Route::get('/blog/edit/{articleId}', function ($articleId) {
    if (Auth::check()) {
        $article = \App\Article::where('id', $articleId)->first();
        $editPath = public_path(("uploaded/" . $article->md_file));
        $content = file_get_contents($editPath);
        return view('blog.edit', [
            'article' => $article,
            'content' => $content
        ]);
    } else {
        return redirect('/admin/login');
    }
});

Route::post('/blog/edited/{articleId}', function (Request $request, $articleId) {
    if (Auth::check()) {
        $validator = Validator::make($request->all(), [
            'title' => 'required|max:255',
            'category' => 'required|max:255',
        ]);
        if ($validator->fails()) {
            return redirect('/blog/edit/' . $articleId)
                ->withInput()
                ->withErrors($validator);
        }

        $article = \App\Article::where('id', $articleId)->first();
        $article->title = $request->title;
        $article->category_split_space = $request->category;
        $article->categories()->detach();
        $categorySplitSpace = explode(" ", $request->category);
        foreach ($categorySplitSpace as $category) {
            $categoryCount = \App\Category::where('name', $category)->count();
            if ($categoryCount == 0) {
                $newCategory = new Category();
                $newCategory->name = $category;
                $newCategory->save();
                $article->categories()->attach($newCategory->id);
            } else {
                $categoryInDB = \App\Category::where('name', $category)->first();
                $article->categories()->attach($categoryInDB->id);
            }
        }

        $content = $request->content;
        $mdFilePath = public_path('uploaded/article/' . $article->id . '/' . $article->id . '.md');
        \File::put($mdFilePath, $content);

        $imgCheck = $request->imgCheck;
        if ($imgCheck == "on") {
            $imgDir = public_path('uploaded/article/' . $article->id . '/image');
            \File::cleanDirectory($imgDir);
            if ($request->file('img') != null) {
                foreach ($request->file('img') as $img) {
                    $imgName = $img->getClientOriginalName();
                    $img->storeAs('article/' . $article->id . '/image', $imgName);
                }
            }
        }

        $article->update();

        return redirect('/blog');
    } else {
        return redirect('/admin/login');
    }
});

Route::get('/blog/post', function () {
    if (Auth::check()) {
        return view('blog.post');
    } else {
        return redirect('/admin/login');
    }
});

Route::post('/blog/posted', function (Request $request) {
    if (Auth::check()) {
        $validator = Validator::make($request->all(), [
            'title' => 'required|max:255',
            'category' => 'required|max:255',
            'mdfile' => 'required',
        ]);

        if ($validator->fails()) {
            return redirect('/blog/post')
                ->withInput()
                ->withErrors($validator);
        }
        $article = new Article();
        $article->title = $request->title;
        $article->category_split_space = $request->category;
        $article->md_file = "dummy";
        $article->save();
        $mdFile = $request->file('mdfile');
        $mdFilePath = $mdFile->storeAs('article/' . $article->id, $article->id . '.md');
        $article->md_file = $mdFilePath;
        $article->save();
        if ($request->file('img') != null) {
            foreach ($request->file('img') as $img) {
                $imgName = $img->getClientOriginalName();
                $img->storeAs('article/' . $article->id . '/image', $imgName);
            }
        }

        $categorySplitSpace = explode(" ", $request->category);
        foreach ($categorySplitSpace as $category) {
            $categoryCount = \App\Category::where('name', $category)->count();
            if ($categoryCount == 0) {
                $newCategory = new Category();
                $newCategory->name = $category;
                $newCategory->save();
                $article->categories()->attach($newCategory->id);
            } else {
                $categoryInDB = \App\Category::where('name', $category)->first();
                $article->categories()->attach($categoryInDB->id);
            }
        }
        return redirect('/blog');
    } else {
        return redirect('/admin/login');
    }
});

Route::post('/blog/search', function (Request $request) {
    $searchWord = $request->search;
    $idArray = array();

    $articlesByTitle = Article::where('title', 'LIKE', "%{$searchWord}%")->get();
    foreach ($articlesByTitle as $article) {
        $id = $article->id;
        if (!in_array($id, $idArray)) {
            $idArray[] = $id;
        }
    }

    $categories = Category::where('name', 'LIKE', "%{$searchWord}%")->get();
    foreach ($categories as $category) {
        $articlesByCategory = $category->articles()->get();
        foreach ($articlesByCategory as $article) {
            $id = $article->id;
            if (!in_array($id, $idArray)) {
                $idArray[] = $id;
            }
        }
    }
    $articles = Article::whereIn('id', $idArray)->orderBy('updated_at', 'desc')->paginate(config('const.BLOG_SETTING.articles_per_page'));
    return view('blog.search', [
        'searchWord' => $searchWord,
        'articles' => $articles
    ]);
});

Route::get('/blog/category/{categoryName}', function ($categoryName) {
    $category = Category::where('name', $categoryName)->first();
    $articles = $category->articles()->paginate(config('const.BLOG_SETTING.articles_per_page'));
    return view('blog.search_category', [
        'categoryName' => $categoryName,
        'articles' => $articles
    ]);
});
