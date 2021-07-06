FROM php:7.4-fpm
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

#Author
LABEL maintainer="banatech.net"

# Install required packages and remove the apt packages cache when done.
RUN apt update && \
    apt upgrade -y && \
    apt install -y \
    curl \
    git \
    ca-certificates \
    procps \
    nodejs \
    npm 
# composer \
# php \
# php-zip \
# php-xml \
# php-json \
# php-mbstring \
# php-mysql \
# php-sqlite3 \
# php-bcmath \
# php-fpm \
# sqlite3 && \
# rm -rf /var/lib/apt/lists/*

# update node npm
RUN npm install n -g
RUN n stable
RUN apt purge -y nodejs npm
ENV PATH $PATH:/usr/local/bin/node
