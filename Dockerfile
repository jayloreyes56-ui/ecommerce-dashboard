# Use PHP 8.4 with CLI
FROM php:8.4-cli

# Install system dependencies including PostgreSQL
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (including pdo_pgsql for PostgreSQL)
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

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
    && chmod -R 775 storage bootstrap/cache

# Create .env file and generate APP_KEY
RUN cp .env.example .env \
    && php artisan key:generate --force

# Expose port
EXPOSE 8080

# Start server - clear config to use Render env vars, but keep generated APP_KEY as fallback
CMD php artisan config:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
