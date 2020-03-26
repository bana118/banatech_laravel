#imagename: banatech_laravel
FROM ubuntu:18.04

# avoid freeze while configuring tzdata 
ENV DEBIAN_FRONTEND=noninteractive

#Author
MAINTAINER banatech

CMD echo "now running..."

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
COPY . /home/docker/code/banatech_laravel

# install laravel and etc
RUN cd /home/docker/code/banatech_laravel && composer install --optimize-autoloader --no-dev

# install npm packages
RUN cd /home/docker/code/banatech_laravel && npm install

# clear laravel caches
# This app doesn't seem to delete the route cache...
RUN cd /home/docker/code/banatech_laravel && php artisan config:cache
# RUN cd /home/docker/code/banatech_laravel && php artisan config:cache && php artisan route:cache

# compile css and js
RUN cd /home/docker/code/banatech_laravel && npm run prod

# add permission
RUN chmod -R 777 /home/docker/code/banatech_laravel/storage
RUN chmod -R 777 /home/docker/code/banatech_laravel/bootstrap/cache

# setup all the configfiles
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
COPY nginx-app.conf /etc/nginx/sites-available/default
COPY supervisor-app.conf /etc/supervisor/conf.d/

# run nginx
EXPOSE 80
EXPOSE 443
CMD ["supervisord", "-n"]
