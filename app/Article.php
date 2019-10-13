<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }
}