<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\URL;
use App\Article;
use App\Category;
use Carbon\Carbon;

class siteMapController extends Controller
{
    public function sitemap()
    {
        //example: https://gitlab.com/Laravelium/Sitemap/-/wikis/Dynamic-sitemap

        // create new sitemap object
        $sitemap = App::make('sitemap');
        $now = Carbon::now();

        // set cache key (string), duration in minutes (Carbon|Datetime|int), turn on/off (boolean)
        // by default cache is disabled
        $sitemap->setCache('laravel.sitemap', 60);

        // check if there is cached sitemap and build new only if is not
        if (!$sitemap->isCached()) {
            // add item to the sitemap (url, date, priority, freq)

            //home
            $sitemap->add(URL::to('/'), $now, '1.0', 'monthly');
            $sitemap->add(URL::to('/privacy_policy'), '2020-03-28T20:00:00+09:00', '0.5', 'yearly');

            //blog
            $sitemap->add(URL::to('/blog'), $now, '0.9', 'monthly');
            // get all blog article from db
            $articles = Article::orderBy('updated_at', 'desc')->get();
            foreach ($articles as $article) {
                $sitemap->add(URL::to('/blog/view/' . $article->id), $article->updated_at, '0.8', 'yearly');
            }
            $sitemap->add(URL::to('/blog/categories'), $now, '0.7', 'monthly');
            $categories = Category::orderBy('updated_at', 'desc')->get();
            foreach ($categories as $category) {
                $sitemap->add(URL::to('/blog/category/' . $category->id), $category->updated_at, '0.6', 'yearly');
            }

            //latex_editor
            $sitemap->add(URL::to('/latex_editor'), '2020-03-28T20:00:00+09:00', '0.9', 'yearly');

            //kurukuru
            $sitemap->add(URL::to('/kurukuru'), '2020-03-28T20:00:00+09:00', '0.9', 'yearly');

            //reiwa
            $sitemap->add(URL::to('/reiwa'), '2020-03-28T20:00:00+09:00', '0.9', 'yearly');
            $sitemap->add(URL::to('/reiwa/solo'), '2020-03-28T20:00:00+09:00', '0.9', 'yearly');

            //hakogucha
            $sitemap->add(URL::to('/hakogucha'), '2020-03-28T20:00:00+09:00', '0.9', 'yearly');

            //vr_meiro
            $sitemap->add(URL::to('/vr_meiro'), '2020-04-06T19:00:00+09:00', '0.9', 'yearly');
            $sitemap->add(URL::to('/vr_meiro/play'), '2020-04-06T19:00:00+09:00', '0.9', 'yearly');

            //shodou
            $sitemap->add(URL::to('/shodou'), '2020-12-30T17:30:00+09:00', '0.9', 'yearly');

            // yorunikakeru_generator
            $sitemap->add(URL::to('/yorunikakeru-generator'), '2021-02-09T17:30:00+09:00', '0.9', 'yearly');
        }

        // show your sitemap (options: 'xml' (default), 'html', 'txt', 'ror-rss', 'ror-rdf')
        return $sitemap->render('xml');
    }
}
