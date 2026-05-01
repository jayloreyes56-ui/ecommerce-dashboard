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
    libsqlite3-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite mbstring exif pcntl bcmath gd

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . /app

# Install dependencies
RUN cd backend && composer install --no-dev --optimize-autoloader

# Create database
RUN cd backend && touch database/database.sqlite && chmod 777 database/database.sqlite

# Generate app key
RUN cd backend && php artisan key:generate

# Run migrations
RUN cd backend && php artisan migrate --force --seed

# Expose port
EXPOSE 8080

# Start server
CMD cd backend && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
