#imagename: banatech_laravel
FROM ubuntu:18.04

# avoid freeze while configuring tzdata
ENV DEBIAN_FRONTEND=noninteractive

#Author
LABEL maintainer="banatech.net"

# Install required packages and remove the apt packages cache when done.
RUN apt update && \
    apt upgrade -y && \
    apt install -y \
    curl \
    git \
    nano \
    vim-nox \
    nginx \
    supervisor \
    nodejs \
    npm \
    composer \
    php \
    php-zip \
    php-xml \
    php-json \
    php-mbstring \
    php-mysql \
    php-sqlite3 \
    php-bcmath \
    php-fpm \
    certbot \
    sqlite3 && \
    rm -rf /var/lib/apt/lists/*

# update node npm
RUN npm install n -g
RUN n stable
RUN apt purge -y nodejs npm
ENV PATH $PATH:/usr/local/bin/node
# add our code
COPY . /root/banatech_laravel

# install packages, but it doesn't work so do it manually in docker

# install laravel and etc
# RUN cd /root/banatech_laravel && composer install --optimize-autoloader --no-dev

# install npm packages
# RUN cd /root/banatech_laravel && npm install

# clear laravel caches
# This app doesn't seem to delete the route cache...
# RUN cd /root/banatech_laravel && php artisan config:cache
# RUN cd /root/banatech_laravel && php artisan config:cache && php artisan route:cache

# generate app key
# RUN cd /root/banatech_laravel && php artisan key:generate

# migrate
# RUN cd /root/banatech_laravel && php artisan migrate

# compile css and js
# RUN cd /root/banatech_laravel && npm run prod


# setup all the configfiles
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
COPY nginx-app.conf /etc/nginx/sites-available/default
COPY supervisor-app.conf /etc/supervisor/conf.d/

# create socket file for php-fpm
RUN mkdir /var/run/php
RUN touch /var/run/php/php7.2-fpm.sock
RUN chmod 777 /var/run/php/php7.2-fpm.sock

# run nginx
EXPOSE 80
EXPOSE 443
CMD ["supervisord", "-n"]
