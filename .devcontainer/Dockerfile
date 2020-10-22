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
    sqlite3 && \
    rm -rf /var/lib/apt/lists/*

# update node npm
RUN npm install n -g
RUN n stable
RUN apt purge -y nodejs npm
ENV PATH $PATH:/usr/local/bin/node
