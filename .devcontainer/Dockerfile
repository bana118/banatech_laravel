FROM php:7.4-fpm
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

#Author
LABEL maintainer="banatech.net"

# Install required packages and remove the apt packages cache when done.
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    curl \
    git \
    ca-certificates \
    procps \
    nodejs \
    npm \
    sqlite3 && \
    apt-get -y clean && \
    rm -rf /var/lib/apt/lists/*

# update node npm
RUN npm install n -g
RUN n stable
RUN apt purge -y nodejs npm
ENV PATH $PATH:/usr/local/bin/node
