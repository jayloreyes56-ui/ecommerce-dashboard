<?php

use Illuminate\Support\Facades\Route;

// Test CORS endpoint
Route::get('/test-cors', function () {
    return response()->json([
        'message' => 'CORS is working!',
        'cors_config' => [
            'CORS_ALLOWED_ORIGINS' => env('CORS_ALLOWED_ORIGINS', 'NOT SET'),
            'FRONTEND_URL' => env('FRONTEND_URL', 'NOT SET'),
            'SANCTUM_STATEFUL_DOMAINS' => env('SANCTUM_STATEFUL_DOMAINS', 'NOT SET'),
            'APP_URL' => env('APP_URL'),
        ],
        'headers' => [
            'Origin' => request()->header('Origin'),
            'Host' => request()->header('Host'),
        ]
    ]);
});
