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

Route::get('/blog/get-all-articles', function () {
    $zipDirectory = function ($dir, $file, $root = "") {
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
    };
    $zipDirectory(public_path() . '/uploaded/article/', public_path() . '/article.zip');
    return response()->download(public_path() . '/article.zip');
});

Route::get('/blog/all_categories', function () {
    $allCategories = Category::orderBy('name', 'asc')->paginate(config('const.BLOG_SETTING.categories_per_page'));
    return view('blog.category', [
        'categories' => $allCategories
    ]);
});

// Return pair of header level, header text, id(with suffix)
// e.g. [[1, "Level1", "Level1"], [2, "Level2", "Level2"], [3, "Level1", "Level1-1"]]
function get_index($contentWithoutCode)
{
    $headerInfo = array();
    $headerIds = array();
    preg_match_all('/^\s*#+\s+.*/m', $contentWithoutCode, $headers);
    foreach ($headers[0] as $header) {
        $header = trim($header);
        preg_match('/^\s*#+/m', $header, $sharps);
        $sharps = preg_replace('/\s/', '', $sharps);
        $level = mb_strlen($sharps[0]);
        if ($level < 7 && $level > 0) {
            $headerText = preg_replace('/^\s*#+\s+/', '', $header);
            $headerId = mb_strtolower($headerText);
            $headerId = preg_replace('/\s|　/', '-', $headerId);
            $headerId = preg_replace('/[!@#\$%\^&\*\(\)\+\|~=`\[\]\{\};\':",\.\/<>?\\\]/', '', $headerId);
            $headerId = preg_replace('/[！＠＃＄％＾＆＊（）＋｜〜＝￥｀「」｛｝；’：”、。・＜＞？【】『』《》〔〕［］‹›«»〘〙〚〛]/u', '', $headerId);
            if (array_key_exists($headerId, $headerIds)) {
                $suffix = $headerIds[$headerId];
                $uniqueHeaderId = "{$headerId}-{$suffix}";
                $headerIds[$headerId] += 1;
                array_push($headerInfo, array($level, $headerText, $uniqueHeaderId));
            } else {
                $headerIds[$headerId] = 1;
                array_push($headerInfo, array($level, $headerText, $headerId));
            }
        }
    }
    return $headerInfo;
}


Route::get('/blog/view/{articleId}', function ($articleId) {
    $articleCount = \App\Article::where('id', $articleId)->count();
    if ($articleCount == 0) {
        return App::abort(404);
    } else {
        $article = \App\Article::where('id', $articleId)->first();

        $nextArticle = \App\Article::where('id', $articleId + 1)->first();
        $previousArticle = \App\Article::where('id', $articleId - 1)->first();

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

        $mdFilePath = public_path("uploaded/" . $article->md_file);

        $codeReg = '/^```.*?\r?\n(.*?\r?\n)*?```/m';
        $imgReg = '/!\[.*?\]\(.*?\)|!\[.*?\]\[.*?\]|\[.*?\]: .*?\"\".*?\"\"/';
        $htmlReg = '/<(\".*?\"|\'.*?\'|[^\'\"])*?>/';
        $headerReg = '/^\s*#+/m';
        $brockquoteReg = '/^>.*$/m';
        $horizontalReg = '/^(\* ){3,}$|^\*{3,}$|^(- ){3,}|^-{3,}$|^(_ ){3,}$|^_{3,}$/m';
        $tableReg = '/^( *\|[^\n]+\| *\r?\n)((?: *\|:?[-]+:?)+\| *)(\r?\n(?: *\|[^\n]+\| *\r?\n?)*)?$/m';
        $emphasizeReg = '/\*(.*?)\*|_(.*?)_|\*\*(.*?)\*\*|__(.*?)__|~~(.*?)~~|`+?(.*?)`+?/';
        $linkReg = '/\[(.*?)\]\((https?|ftp)(:\/\/[-_.!~*\\\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)\)/';

        $content = file_get_contents($mdFilePath);
        $content = preg_replace($codeReg, '', $content);
        $headerIds = get_index($content);

        $content = preg_replace($imgReg, '', $content);
        $content = preg_replace($htmlReg, '', $content);
        $content = preg_replace($headerReg, '', $content);
        $content = preg_replace($brockquoteReg, '', $content);
        $content = preg_replace($horizontalReg, '', $content);
        $content = preg_replace($tableReg, '', $content);
        $content = preg_replace($emphasizeReg, '$1$2$3$4$5$6', $content);
        $content = preg_replace($linkReg, '$1', $content);
        $content = preg_replace('/\r?\n/', ' ', $content);

        $descriptionLength = 120;
        if (mb_strlen($content) > $descriptionLength) {
            $description = mb_substr($content, 0, $descriptionLength) . '...';
            return view('blog.view', [
                'article' => $article,
                'nextArticle' => $nextArticle,
                'previousArticle' => $previousArticle,
                'relatedArticles' => $relatedArticles,
                'description' => $description,
                'headerIds' => $headerIds
            ]);
        } else {
            return view('blog.view', [
                'article' => $article,
                'nextArticle' => $nextArticle,
                'previousArticle' => $previousArticle,
                'relatedArticles' => $relatedArticles,
                'description' => $content,
                'headerIds' => $headerIds
            ]);
        }
    }
});

Route::get('/blog/delete/{articleId}', function ($articleId) {
    $articleCount = \App\Article::where('id', $articleId)->count();
    if ($articleCount == 0) {
        return App::abort(404);
    } else {
        if (!Auth::check()) {
            return redirect('/admin/login');
        } else {
            $article = \App\Article::where('id', $articleId)->first();
            $prevCategories = $article->categories()->get();
            $deleteDirPath = "uploaded/article/" . $article->id;
            File::deleteDirectory(public_path($deleteDirPath));
            $article->delete();
            foreach ($prevCategories as $prevCategory) {
                if ($prevCategory->articles()->count() == 0) {
                    $prevCategory->delete();
                }
            }
            return redirect('/blog');
        }
    }
});

Route::get('/blog/edit/{articleId}', function ($articleId) {
    $articleCount = \App\Article::where('id', $articleId)->count();
    if ($articleCount == 0) {
        return App::abort(404);
    } else {
        if (!Auth::check()) {
            return redirect('/admin/login');
        } else {
            $article = \App\Article::where('id', $articleId)->first();
            $editPath = public_path(("uploaded/" . $article->md_file));
            $content = file_get_contents($editPath);
            return view('blog.edit', [
                'article' => $article,
                'content' => $content
            ]);
        }
    }
});

Route::post('/blog/edited/{articleId}', function (Request $request, $articleId) {
    if (!Auth::check()) {
        return redirect('/admin/login');
    } else {
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
        $prevCategories = $article->categories()->get();
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

        foreach ($prevCategories as $prevCategory) {
            if ($prevCategory->articles()->count() == 0) {
                $prevCategory->delete();
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
        # update updated_at column
        $article->touch();

        # update html file
        exec("node " . base_path() . "/scripts/generate-article.js " . $article->id);

        return redirect('/blog');
    }
});

Route::get('/blog/post', function () {
    if (!Auth::check()) {
        return redirect('/admin/login');
    } else {
        return view('blog.post');
    }
});

Route::post('/blog/posted', function (Request $request) {
    if (!Auth::check()) {
        return redirect('/admin/login');
    } else {
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

        # update html file
        exec("node " . base_path() . "/scripts/generate-article.js " . $article->id);

        return redirect('/blog');
    }
});

Route::get('/blog/search', function (Request $request) {
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

Route::get('/blog/category/{categoryId}', function ($categoryId) {
    $category = Category::where('id', $categoryId)->first();
    $categoryCount = \App\Category::where('id', $categoryId)->count();
    if ($categoryCount == 0) {
        return App::abort(404);
    } else {
        $categoryName = $category->name;
        $articles = $category->articles()->orderBy('updated_at', 'desc')->paginate(config('const.BLOG_SETTING.articles_per_page'));
        return view('blog.search_category', [
            'categoryName' => $categoryName,
            'articles' => $articles
        ]);
    }
});
