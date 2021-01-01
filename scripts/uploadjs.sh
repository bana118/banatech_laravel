#!/bin/bash
# Use when "npm run prod" is not available on the server
HOST=banatech
rm public/*.js
rm public/*.js.gz
npm run prod
scp public/*.js $HOST:~/banatech_laravel/public
scp public/*.js.gz $HOST:~/banatech_laravel/public
scp public/mix-manifest.json $HOST:~/banatech_laravel/public
scp -r public/js $HOST:~/banatech_laravel/public
scp -r public/css $HOST:~/banatech_laravel/public
scp -r public/fonts $HOST:~/banatech_laravel/public
