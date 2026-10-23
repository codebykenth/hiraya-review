# syntax=docker/dockerfile:1

# PHP2Shell patch: pinned to 8.4.27 (fixes CVE-2026-109618 & CVE-2026-109619)
FROM serversideup/php:8.4.27-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Switch to root to install the Node toolchain and PHP extensions
USER root

# Node2Shell patch (CVE-2026-111497): use patched Node 24.22.1 from the official
# image instead of the distro's EOL build, and build with the pnpm lockfile we ship.
COPY --from=node:24.22.1-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24.22.1-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && npm install -g pnpm@12.15.0

# Install essential PHP extensions for Laravel 13
RUN apt-get update \
    && install-php-extensions pdo_mysql gd zip bcmath opcache \
    && rm -rf /var/lib/apt/lists/*

# PHP2Shell hard mitigation: disable session upload progress (CVE-2026-109618 attack surface).
# This image does not translate PHP_INI_* env vars, so write a real ini drop-in.
RUN printf '%s\n' 'session.upload_progress.enabled = Off' > "$PHP_INI_DIR/conf.d/zz-php2shell.ini"

# Copy application files with correct ownership
COPY --chown=www-data:www-data . .

# Set environment variables for build and runtime
ENV APP_NAME="Civil Service Exam Reviewer"

# 1. Install production PHP dependencies (required for Wayfinder to boot Laravel)
RUN composer install --no-dev --optimize-autoloader

# 2. Install Node dependencies and build assets
RUN pnpm install --frozen-lockfile && pnpm run build

# 3. Remove the Node toolchain; it is only needed at build time
RUN rm -rf node_modules /root/.local/share/pnpm /root/.cache \
    && rm -rf /usr/local/lib/node_modules /usr/local/bin/node \
              /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/pnpm /usr/local/bin/pnpx

# Copy the startup script to ServerSideUp's entrypoint directory
COPY --chmod=755 scripts/00-laravel-deploy.sh /etc/entrypoint.d/00-laravel-deploy.sh

# Copy custom Nginx security rules into ServerSideUp's server-opts.d directory (included inside server { ... })
COPY conf/nginx/security.conf /etc/nginx/server-opts.d/security.conf

# Limit PHP-FPM workers and script memory to prevent OOM on Render 512MB instances
ENV PHP_FPM_PM_MAX_CHILDREN=5 \
    PHP_MEMORY_LIMIT=128M

# Expose port 8080 (ServerSideUp default)
EXPOSE 8080

# Switch back to the non-root www-data user for execution
USER www-data
