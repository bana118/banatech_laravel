# banatech_laravel
laravel 6.0
php 7.2

# ローカル開発

```
$ git clone https://github.com/bana118/banatech_laravel.git
$ cd banatech_laravel
$ cp .env.dev .env
$ composer install
$ php artisan key:generate
$ php artisan migrate
$ npm i
$ npm run dev
$ php artisan serve
```

# デプロイ

## dockerのインストール
[Install Docker Engine \| Docker Documentation](https://docs.docker.com/engine/install/)

## 注意！

docker run -v するとホスト側のディレクトリがコンテナ側のディレクトリを上書きします。public/uploaded ディレクトリやdatabase.sqlite3 ファイルはうっかり消しかねないのでバックアップ必須です。.env などもホスト側のものが使用されかねないので注意が必要です。docker内に入り.env のAPP_KEYを確かめる必要があります。
そのときはdocker内に入り以下のコマンドを実行。

```
$ sudo docker exec -i -t banatech bash
# cd ~/banatech_laravel
# composer install --optimize-autoloader --no-dev
# npm install
# npm run prod
# php artisan key:generate
```

## httpのみでデプロイ

```
$ cd
$ git clone https://github.com/bana118/banatech_laravel.git
$ cd banatech_laravel
$ cp .env.prod .env
$ cp nginx-app.conf.temp nginx-app.conf
$ chmod -R 777 storage
$ chmod -R 777 bootstrap/cache
$ chmod -R 777 database
$ chmod -R 777 public
$ sudo docker build -t banatech_laravel .
$ sudo docker run --name banatech -d -p 80:80 -p 443:443 -v ~:/root -v /etc/letsencrypt:/etc/letsencrypt banatech_laravel
$ sudo docker exec -i -t banatech bash
# cd ~/banatech_laravel
# composer install --optimize-autoloader --no-dev
# npm install
# npm run prod
```

## letsencryptで証明書取得

```
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt update
$ sudo apt install -y certbot
$ sudo certbot certonly --webroot -w ~/banatech_laravel/public -d example.com
```

メールアドレスの入力，規約の承諾などを行う．

## httpsでデプロイ

```
$ mv nginx-app.conf nginx-app.conf.temp
$ cp nginx-app.conf.prod nginx-app.conf
$ cd
$ mkdir dhparam
$ openssl dhparam -out ~/dhparam/dhparam4096.pem 4096
$ sudo docker exec -i -t banatech bash
# cd ~/banatech_laravel
# mv nginx-app.conf nginx-app.conf.temp
# cp nginx-app.conf.prod nginx-app.conf
# cp nginx-app.conf /etc/nginx/sites-available/default
# supervisorctl restart nginx
```

## letsencrypt更新確認

```
$ sudo certbot renew --force-renew --dry-run --webroot-path ~/banatech_laravel/public
```

## letsencrypt自動更新

```
$ crontab -e
```

crontabに以下を追記

```
0 4 1 * * sudo certbot renew && sudo docker restart banatech
```

## 更新

```
$ git pull
$ docker restart banatech
```

必要に応じて

```
$ sudo docker exec -i -t banatech bash
# composer update
# composer install --optimize-autoloader --no-dev
# php artisan migrate
# npm ci
# npm run prod
```

## docker内確認

```
$ sudo docker exec -i -t banatech bash
```

## アップロードサイズ，ポストのサイズの上限解放
php.iniを編集
```
$ sudo docker exec -i -t banatech bash
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
