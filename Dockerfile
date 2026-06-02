FROM php:8.2-apache

RUN docker-php-ext-install mysqli
RUN a2enmod rewrite headers

# Enable CORS preflight handling (headers module already enabled)
COPY ./api /var/www/html/api

# Keep a simple health endpoint
RUN printf "<?php echo \"ok\"; ?>" > /var/www/html/health.php

