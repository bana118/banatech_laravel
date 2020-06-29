# banatech_laravel
laravel 6.0
php 7.2

# ローカル開発

```
$ cp .env.dev .env
$ composer install
$ php artisan key:generate
$ php artisan migrate
$ npm i
$ npm run dev
$ php artisan serve
```

# デプロイ

## 注意！

docker run -v するとホスト側のディレクトリがコンテナ側のディレクトリを上書きします。public/uploaded ディレクトリやdatabase.sqlite3 ファイルはうっかり消しかねないのでバックアップ必須です。.env などもホスト側のものが使用されかねないので注意が必要です。docker内に入り.env のAPP_KEYを確かめる必要があります。
そのときはdocker内に入り以下のコマンドを実行。

```
$ sudo docker exec -i -t ${container_id} bash
# cd /home/docker/code/banatech_laravel
# composer install --optimize-autoloader --no-dev
# npm install
# npm run prod
# php artisan key:generate
```

## httpのみでデプロイ

```
$ sudo cp .env.prod .env
$ sudo cp nginx-app.conf.temp nginx-app.conf
$ sudo chmod -R 777 storage
$ sudo chmod -R 777 bootstrap/cache
$ sudo chmod -R 777 database
$ sudo chmod -R 777 public
$ sudo docker build -t banatech_laravel .
$ sudo docker run -d -p 80:80 -p 443:443 -v /home/docker/code:/home/docker/code -v /etc/letsencrypt:/etc/letsencrypt banatech_laravel
$ sudo docker exec -i -t ${container_id} bash
# cd /home/docker/code/banatech_laravel
# composer install --optimize-autoloader --no-dev
# npm install
# npm run prod
```

## letsencryptで証明書取得

```
$ apt-get install certbot
$ sudo certbot certonly --webroot -w /home/docker/code/banatech_laravel/public -d mydomain.com
```

## httpsでデプロイ

```
$ sudo mv nginx-app.conf nginx-app.conf.temp
$ sudo cp nginx-app.conf.prod nginx-app.conf
$ sudo mkdir -p /home/docker/code/dhparam
$ sudo openssl dhparam -out /home/docker/code/dhparam/dhparam4096.pem 4096
$ sudo docker exec -i -t ${container_id} bash
# cd /home/docker/code/banatech_laravel
# mv nginx-app.conf nginx-app.conf.temp
# cp nginx-app.conf.prod nginx-app.conf
# cp nginx-app.conf /etc/nginx/sites-available/default
# supervisorctl restart nginx
```

## letsencrypt更新確認

```
$ sudo certbot renew --force-renew --dry-run --webroot-path /home/docker/code/banatech_laravel/public
```
certbotのバージョンが0.32以前だと--dry-runでエラーが起きるそうです。
[Problem with renew certificates - The request message was malformed :: Method not allowed - Help - Let's Encrypt Community Support](https://community.letsencrypt.org/t/problem-with-renew-certificates-the-request-message-was-malformed-method-not-allowed/107889)

## letsencrypt自動更新

```
$ crontab -e
```

crontabに以下追記

```
0 4 1 * * sudo certbot renew && sudo docker restart ${container_id}
```

## 更新

```
$ sudo git pull
$ sudo cp -pR ./ /home/docker/code/banatech_laravel
$ docker restart ${container_id}
```

必要に応じて

```
$ sudo docker exec -i -t ${container_id} bash
# composer update
# composer install --optimize-autoloader --no-dev
# npm install
# npm run prod
```

## docker内確認

```
$ sudo docker exec -i -t ${container_id} bash
```

## アップロードサイズ，ポストのサイズの上限解放
php.iniを編集
```
$ sudo docker exec -i -t ${container_id} bash
# vim /etc/php/7.2/fpm/php.ini
```

以下のように変更する
```
post_max_size = 128M
upload_max_filesize = 64M
max_execution_time = 120
max_input_time = 240
memory_limit = 512M
```
