FROM serversideup/php:8.4-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Switch to root to install Node.js and NPM (needed to compile assets)
USER root

# Install Node.js, NPM, and essential PHP extensions for Laravel 13
RUN apt-get update && apt-get install -y --no-install-recommends nodejs npm \
    && install-php-extensions pdo_mysql gd zip bcmath opcache \
    && rm -rf /var/lib/apt/lists/*

# Copy application files with correct ownership
COPY --chown=www-data:www-data . .

# Set environment variables for build and runtime
ENV APP_NAME "Civil Service Exam Reviewer"

# 1. Install production PHP dependencies (required for Wayfinder to boot Laravel)
RUN composer install --no-dev --optimize-autoloader

# 2. Install Node dependencies and build assets
RUN npm ci && npm run build

# 3. Clean up node_modules to keep image size small
RUN rm -rf node_modules && apt-get purge -y nodejs npm && apt-get autoremove -y

# Copy the startup script to ServerSideUp's entrypoint directory
COPY --chmod=755 scripts/00-laravel-deploy.sh /etc/entrypoint.d/00-laravel-deploy.sh

# Expose port 8080 (ServerSideUp default)
EXPOSE 8080

# Switch back to the non-root www-data user for execution
USER www-data