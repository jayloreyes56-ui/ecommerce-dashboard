<?php

/**
 * Laravel development server router
 * Suppresses deprecation warnings for cleaner output
 */

// Suppress deprecation warnings in development
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

// Get the requested URI
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Serve static files directly
if ($uri !== '/' && file_exists(__DIR__ . '/public' . $uri)) {
    return false;
}

// Otherwise, route through Laravel
require_once __DIR__ . '/public/index.php';
