# banatech_laravel
![PHP](https://img.shields.io/static/v1?label=php&message=v7.2&color=474A8A&logo=php)
![Laravel](https://img.shields.io/static/v1?label=Laravel&message=v6.0&color=F05340&logo=laravel)
![Node.js](https://img.shields.io/static/v1?label=Node.js&message=v12.16.3&color=339933&logo=node.js)  
[![Laravel_prod](https://github.com/bana118/banatech_laravel/workflows/Laravel_prod/badge.svg)](https://github.com/bana118/banatech_laravel/actions?query=workflow%3ALaravel_prod)
[![Http_status](https://github.com/bana118/banatech_laravel/workflows/Http_status/badge.svg)](https://github.com/bana118/banatech_laravel/actions?query=workflow%3AHttp_status)

# ローカル開発

```
$ git clone https://github.com/bana118/banatech_laravel.git
$ cd banatech_laravel
$ touch database/database.sqlite3
$ cp .env.dev .env
$ composer install
$ php artisan key:generate
$ php artisan migrate
$ npm ci
$ npm run dev
$ php artisan serve
```

## 管理者アカウント作成

```
$ php artisan voyager:admin your@email.com --create
```

# ローカル開発([VSCode Remote Containers](https://code.visualstudio.com/docs/remote/containers))

[Visual Studio Code](https://azure.microsoft.com/ja-jp/products/visual-studio-code/)と[Remote \- Containers 拡張](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)を用いてコンテナ内で開発．  
Windows，Mac などではファイル IO が遅いので注意．  
VSCode の Remote Containers 拡張を用いてコンテナ内でこのリポジトリを開く．

```
$ git clone https://github.com/bana118/banatech_laravel.git
$ code banatech_laravel
```

コンテナ内で以下のコマンドを実行

```
# cp .env.dev .env
# composer install
# php artisan key:generate
# php artisan migrate
# npm ci
# npm run dev
# php artisan serve
```

# デプロイ

## docker のインストール

[Install Docker Engine \| Docker Documentation](https://docs.docker.com/engine/install/)

## 注意！

docker run -v するとホスト側のディレクトリがコンテナ側のディレクトリを上書きします。public/uploaded ディレクトリや database.sqlite3 ファイルはうっかり消しかねないのでバックアップ必須です。.env などもホスト側のものが使用されかねないので注意が必要です。docker 内に入り.env の APP_KEY を確かめる必要があります。
そのときは docker 内に入り以下のコマンドを実行。

```
$ sudo docker exec -i -t banatech bash
# cd ~/banatech_laravel
# composer install --optimize-autoloader --no-dev
# npm install
# npm run prod
# php artisan key:generate
```

## http のみでデプロイ

```
$ cd
$ git clone https://github.com/bana118/banatech_laravel.git
$ cd banatech_laravel
$ touch database/database.sqlite3
$ cp .env.production .env
$ sudo chmod -R 777 storage
$ sudo chmod -R 777 bootstrap/cache
$ sudo chmod -R 777 database
$ sudo chmod -R 777 public
$ sudo chmod -R 777 resources
$ sudo chmod -R 777 scripts
$ sudo docker build -t banatech_laravel .
$ sudo docker run --name banatech -d -p 80:80 -p 443:443 -v ~:/root -v /etc/letsencrypt:/etc/letsencrypt banatech_laravel
$ sudo docker exec -i -t banatech bash
# cd ~/banatech_laravel
# composer install --optimize-autoloader --no-dev
# npm ci
# npm run prod
# php artisan migrate
# php artisan voyager:admin your@email.com --create
# cp deploy/nginx-app.conf.temp /etc/nginx/sites-available/default
# supervisorctl restart nginx
```

## letsencrypt で証明書取得

```
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt update
$ sudo apt install -y certbot
$ sudo certbot certonly --webroot -w ~/banatech_laravel/public -d example.com
```

メールアドレスの入力，規約の承諾，メール配信の有無の回答を行う．

## https でデプロイ

```
$ cd
$ mkdir dhparam
$ openssl dhparam -out ~/dhparam/dhparam4096.pem 4096
$ sudo docker exec -i -t banatech bash
# cd ~/banatech_laravel
# cp deploy/nginx-app.conf.prod /etc/nginx/sites-available/default
# supervisorctl restart nginx
```

## letsencrypt 更新確認

```
$ sudo certbot renew --force-renew --dry-run --webroot-path ~/banatech_laravel/public
```

## letsencrypt 自動更新

```
$ crontab -e
```

crontab に以下を追記

```
0 4 1 * * sudo certbot renew && sudo docker restart banatech
```

## 更新

git でpermissionの変更を無視する

```
$ git config core.filemode false
$ sudo git pull
$ sudo docker restart banatech
```

必要に応じて

```
$ sudo docker exec -i -t banatech bash
# cd ~/banatech_laravel
# composer install --optimize-autoloader --no-dev
# php artisan migrate
# npm ci
# npm run prod
```

## docker 内確認

```
$ sudo docker exec -i -t banatech bash
```

## アップロードサイズ，ポストのサイズの上限解放

php.ini を編集

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

## ブログ記事のHTMLファイル作成
public/uploaded/article 以下にあるMarkdownファイルをHTMLファイルに変換

```
$ sudo docker exec -i -t banatech bash
# cd ~/banatech_laravel
# node scripts/generate-article.js
```

## npm run prodがサーバーで実行できないとき
サーバーの性能などの問題で`npm run prod`が実行できないときはローカルでビルドし，ビルド済みのファイルをサーバーにsshでアップロードする．

```
$ ./scripts/uploadjs.sh
```
