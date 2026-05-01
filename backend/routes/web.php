<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'eCommerce Dashboard API',
        'version' => '1.0.0',
        'status' => 'running',
        'endpoints' => [
            'api' => '/api/v1',
            'health' => '/up',
        ],
    ]);
});
