#!/bin/bash
# Upload tmp files to server

HOST=banatech
scp -r public/other/tmp $HOST:~/banatech_laravel/public/other
