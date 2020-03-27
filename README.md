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

## httpのみでデプロイ

```
$ cp .env.example .env
$ cp nginx-app.conf.temp nginx-app.conf
$ sudo chmod -R 777 storage
$ sudo chmod -R 777 bootstrap/cache
$ sudo chmod -R 777 database
$ sudo chmod -R 777 public
$ sudo docker build -t banatech_laravel .
$ sudo docker run -d -p 80:80 -p 443:443 -v /home/docker/code:/home/docker/code -v /etc/letsencrypt:/etc/letsencrypt banatech_laravel
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
$ sudo mkdir /home/docker/code/dhparam
$ sudo openssl dhparam -out /home/docker/code/dhparam/dhparam4096.pem 4096
$ sudo docker stop ${container_id}
$ sudo docker rm ${exist_container_id}
$ sudo docker build -t banatech_laravel .
$ sudo docker run -d -p 80:80 -p 443:443 -v /home/docker/code:/home/docker/code -v /etc/letsencrypt:/etc/letsencrypt banatech_laravel
```

## letsencrypt更新確認

```
$ sudo certbot renew --force-renew --dry-run --webroot-path /home/docker/code/banatech_laravel/public
```

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
> sudo git pull
> sudo cp -pR ./ docker/code/banatech_laravel
> sudo docker restart ${container_id}
```

## docker内確認

```
sudo docker exec -i -t ${container_id} bash
```
