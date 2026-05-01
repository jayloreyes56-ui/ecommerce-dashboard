<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Public ──────────────────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])
            ->middleware('throttle:10,1'); // 10 attempts per minute
    });

    // ── Protected ───────────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'active.user'])->group(function () {

        // Auth
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('logout-all', [AuthController::class, 'logoutAll']);
            Route::get('me', [AuthController::class, 'me']);
        });

        // Profile & Settings
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::put('/', [ProfileController::class, 'update']);
            Route::put('password', [ProfileController::class, 'changePassword']);
            Route::get('notifications', [ProfileController::class, 'getNotificationSettings']);
            Route::put('notifications', [ProfileController::class, 'updateNotificationSettings']);
        });

        // Dashboard & Reports
        Route::prefix('dashboard')->group(function () {
            Route::get('summary', [ReportController::class, 'summary']);
            Route::get('sales-chart', [ReportController::class, 'salesChart']);
            Route::get('top-products', [ReportController::class, 'topProducts']);
        });

        Route::prefix('reports')->group(function () {
            Route::get('sales', [ReportController::class, 'sales']);
            Route::get('customers', [ReportController::class, 'customers']);
            Route::get('sales/export', [ReportController::class, 'exportSales']);
            Route::get('customers/export', [ReportController::class, 'exportCustomers']);
            Route::get('products/export', [ReportController::class, 'exportProducts']);
        });

        // Products
        Route::apiResource('products', ProductController::class);
        Route::post('products/bulk-delete', [ProductController::class, 'bulkDelete']);
        Route::post('products/{product}/stock', [ProductController::class, 'adjustStock']);
        Route::get('products/{product}/stock/logs', [ProductController::class, 'stockLogs']);
        Route::post('products/{product}/images', [ProductController::class, 'uploadImages']);

        // Categories
        Route::apiResource('categories', CategoryController::class)->except(['show']);

        // Orders
        Route::apiResource('orders', OrderController::class);
        Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::patch('orders/{order}/payment', [OrderController::class, 'updatePayment']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::get('orders/{order}/history', [OrderController::class, 'history']);

        // Customers
        Route::apiResource('customers', CustomerController::class)->except(['destroy']);
        Route::get('customers/{customer}/orders', [CustomerController::class, 'orders']);

        // Messages / Conversations
        Route::get('conversations', [MessageController::class, 'indexConversations']);
        Route::post('conversations', [MessageController::class, 'startConversation']);
        Route::get('conversations/{conversation}', [MessageController::class, 'showConversation']);
        Route::post('conversations/{conversation}/messages', [MessageController::class, 'sendMessage']);
        Route::post('conversations/{conversation}/read', [MessageController::class, 'markRead']);
        Route::patch('conversations/{conversation}/assign', [MessageController::class, 'assign']);
        Route::patch('conversations/{conversation}/close', [MessageController::class, 'close']);
        Route::patch('conversations/{conversation}/reopen', [MessageController::class, 'reopen']);

        // Users — Admin only
        Route::apiResource('users', UserController::class);
        Route::put('users/{user}/password', [UserController::class, 'changePassword']);
    });
});
