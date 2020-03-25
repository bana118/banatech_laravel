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
	certbot \
	sqlite3 && \
    rm -rf /var/lib/apt/lists/*

# update node npm
RUN npm install n -g
RUN n stable
RUN apt purge -y nodejs npm

# install laravel and etc
RUN cd /home/docker/code/banatech_laravel && composer install --optimize-autoloader --no-dev

# install npm packages
RUN cd /home/docker/code/banatech_laravel && npm install

# clear laravel caches
RUN php artisan config:cache && php artisan route:cache

# setup all the configfiles
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
COPY nginx-app.conf /etc/nginx/sites-available/default
COPY supervisor-app.conf /etc/supervisor/conf.d/

# add (the rest of) our code
COPY . /home/docker/code/
EXPOSE 80
EXPOSE 443
CMD ["supervisord", "-n"]

#今はmakemigrations, migrate, createsuperuserは手動で行うことにする
#RUN python3 /home/docker/code/banatech/manage.py collectstatic
#RUN apt-get update
#RUN apt-get install language-pack-ja
#RUN update-locale LANG=ja_JP.UTF-8
#RUN export LANG=ja_JP.UTF-8
#RUN python3 /home/docker/code/banatech/manage.py makemigrations
#RUN python3 /home/docker/code/banatech/manage.py migrate
#RUN python3 /home/docker/code/banatech/manage.py createsuperuser
