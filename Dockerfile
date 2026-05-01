# Use PHP 8.4 with CLI
FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite mbstring exif pcntl bcmath gd

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app/backend

# Copy all application files first
COPY backend/ ./

# Install dependencies (all files are present now)
RUN composer install --no-dev --optimize-autoloader

# Remove cached service providers that reference dev dependencies
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php

# Set proper permissions for Laravel
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    database \
    && chmod -R 775 storage bootstrap/cache \
    && touch database/database.sqlite \
    && chmod 664 database/database.sqlite

# Create .env from example and configure for production
RUN cp .env.example .env \
    && sed -i 's/APP_ENV=production/APP_ENV=production/' .env \
    && sed -i 's/APP_DEBUG=false/APP_DEBUG=false/' .env \
    && sed -i 's/DB_CONNECTION=pgsql/DB_CONNECTION=sqlite/' .env \
    && sed -i 's/CACHE_DRIVER=redis/CACHE_DRIVER=file/' .env \
    && sed -i 's/QUEUE_CONNECTION=redis/QUEUE_CONNECTION=sync/' .env \
    && sed -i 's/SESSION_DRIVER=redis/SESSION_DRIVER=file/' .env

# Generate application key
RUN php artisan key:generate --force

# Cache configuration and routes
RUN php artisan config:cache \
    && php artisan route:cache

# Run migrations and seed
RUN php artisan migrate --force --seed

# Expose port
EXPOSE 8080

# Start server
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
