<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * This namespace is applied to your controller routes.
     *
     * In addition, it is set as the URL generator's root namespace.
     *
     * @var string
     */
    protected $namespace = 'App\Http\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        //

        parent::boot();
    }

    /**
     * Define the routes for the application.
     *
     * @return void
     */
    public function map()
    {
        //$this->mapApiRoutes();

        //$this->mapWebRoutes();

        $this->mapHomeRoutes();
        $this->mapBlogRoutes();
        $this->mapLatexEditorRoutes();
        $this->mapKurukuruRoutes();
        $this->mapHakoguchaRoutes();
        $this->mapReiwaRoutes();
        $this->mapVrMeiroRoutes();
        $this->mapShakyoRoutes();
        $this->mapYorunikakeruGeneratorRoutes();
    }

    protected function mapHomeRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/home.php'));
    }

    protected function mapBlogRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/blog.php'));
    }

    protected function mapLatexEditorRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/latex_editor.php'));
    }

    protected function mapKurukuruRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/kurukuru.php'));
    }

    protected function mapHakoguchaRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/hakogucha.php'));
    }

    protected function mapReiwaRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/reiwa.php'));
    }

    protected function mapVrMeiroRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/vr_meiro.php'));
    }

    protected function mapShakyoRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/shodou.php'));
    }

    protected function mapYorunikakeruGeneratorRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/yorunikakeru_generator.php'));
    }

    /**
     * Define the "web" routes for the application.
     *
     * These routes all receive session state, CSRF protection, etc.
     *
     * @return void
     */
    /*
    protected function mapWebRoutes()
    {
        Route::middleware('web')
             ->namespace($this->namespace)
             ->group(base_path('routes/web.php'));
    }
    */

    /**
     * Define the "api" routes for the application.
     *
     * These routes are typically stateless.
     *
     * @return void
     */
    /*
    protected function mapApiRoutes()
    {
        Route::prefix('api')
             ->middleware('api')
             ->namespace($this->namespace)
             ->group(base_path('routes/api.php'));
    }
    */
}
