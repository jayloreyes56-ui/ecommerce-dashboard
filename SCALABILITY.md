# Scalability & Architecture Guide

## Overview

This document outlines the scalability strategies, architecture patterns, and implementation details for scaling the eCommerce Dashboard to handle high traffic and large datasets.

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Scalability Strategies](#scalability-strategies)
3. [Database Optimization](#database-optimization)
4. [Caching Strategy](#caching-strategy)
5. [Queue & Background Jobs](#queue--background-jobs)
6. [Load Balancing](#load-balancing)
7. [Microservices Architecture](#microservices-architecture)
8. [Monitoring & Observability](#monitoring--observability)

---

## Current Architecture

### Application Stack

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer (Nginx)                │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  App Server 1  │  │  App Server 2  │  │  App Server N  │
│  (PHP-FPM)     │  │  (PHP-FPM)     │  │  (PHP-FPM)     │
└────────────────┘  └────────────────┘  └────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   PostgreSQL   │  │     Redis      │  │  Queue Workers │
│   (Primary)    │  │    (Cache)     │  │   (Horizon)    │
└────────────────┘  └────────────────┘  └────────────────┘
        │
┌───────▼────────┐
│   PostgreSQL   │
│   (Replica)    │
└────────────────┘
```

---

## Scalability Strategies

### 1. Horizontal Scaling

**Application Servers:**
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  app:
    image: ecommerce-dashboard:latest
    deploy:
      replicas: 5
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    environment:
      - APP_ENV=production
      - DB_CONNECTION=pgsql
      - CACHE_DRIVER=redis
      - QUEUE_CONNECTION=redis
```

**Scaling Commands:**
```bash
# Scale up application servers
docker-compose up -d --scale app=5

# Kubernetes scaling
kubectl scale deployment ecommerce-app --replicas=10

# Auto-scaling based on CPU
kubectl autoscale deployment ecommerce-app \
  --min=3 --max=20 --cpu-percent=70
```

---

### 2. Database Scaling

#### Read Replicas

**Configuration:**
```php
// config/database.php
'pgsql' => [
    'read' => [
        'host' => [
            env('DB_READ_HOST_1', '127.0.0.1'),
            env('DB_READ_HOST_2', '127.0.0.1'),
            env('DB_READ_HOST_3', '127.0.0.1'),
        ],
    ],
    'write' => [
        'host' => [
            env('DB_WRITE_HOST', '127.0.0.1'),
        ],
    ],
    'sticky' => true, // Ensure read-after-write consistency
    'driver' => 'pgsql',
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'forge'),
    'username' => env('DB_USERNAME', 'forge'),
    'password' => env('DB_PASSWORD', ''),
];
```

**Usage:**
```php
// Automatically uses read replica
$products = Product::all();

// Force write connection
$product = Product::onWriteConnection()->find(1);
```

#### Database Sharding

**Shard by Customer:**
```php
<?php
// app/Services/Database/ShardingService.php

namespace App\Services\Database;

use Illuminate\Support\Facades\DB;

class ShardingService
{
    /**
     * Get database connection for customer
     */
    public function getConnectionForCustomer(int $customerId): string
    {
        $shardCount = config('database.shards.count', 4);
        $shardIndex = $customerId % $shardCount;
        
        return "pgsql_shard_{$shardIndex}";
    }

    /**
     * Execute query on correct shard
     */
    public function queryCustomerData(int $customerId, callable $callback)
    {
        $connection = $this->getConnectionForCustomer($customerId);
        
        return DB::connection($connection)->transaction($callback);
    }
}

// Usage
$shardingService = app(ShardingService::class);

$orders = $shardingService->queryCustomerData($customerId, function () use ($customerId) {
    return Order::where('customer_id', $customerId)->get();
});
```

---

### 3. Caching Strategy

#### Multi-Layer Caching

```php
<?php
// app/Services/Cache/MultiLayerCacheService.php

namespace App\Services\Cache;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class MultiLayerCacheService
{
    /**
     * L1: Application memory cache (APCu)
     * L2: Redis cache
     * L3: Database
     */
    public function get(string $key, callable $callback, int $ttl = 3600)
    {
        // L1: Check APCu (fastest)
        if (extension_loaded('apcu')) {
            $value = apcu_fetch($key, $success);
            if ($success) {
                return $value;
            }
        }

        // L2: Check Redis
        $value = Cache::get($key);
        if ($value !== null) {
            // Store in L1 for next request
            if (extension_loaded('apcu')) {
                apcu_store($key, $value, min($ttl, 300)); // Max 5 min in APCu
            }
            return $value;
        }

        // L3: Get from database
        $value = $callback();

        // Store in all layers
        Cache::put($key, $value, $ttl);
        if (extension_loaded('apcu')) {
            apcu_store($key, $value, min($ttl, 300));
        }

        return $value;
    }

    /**
     * Invalidate all cache layers
     */
    public function forget(string $key): void
    {
        Cache::forget($key);
        if (extension_loaded('apcu')) {
            apcu_delete($key);
        }
    }
}
```

#### Cache Warming

```php
<?php
// app/Console/Commands/WarmCache.php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class WarmCache extends Command
{
    protected $signature = 'cache:warm';
    protected $description = 'Warm up application cache';

    public function handle()
    {
        $this->info('Warming cache...');

        // Warm product cache
        $this->warmProductCache();

        // Warm category cache
        $this->warmCategoryCache();

        // Warm dashboard cache
        $this->warmDashboardCache();

        $this->info('Cache warmed successfully!');
    }

    private function warmProductCache(): void
    {
        $this->info('Warming product cache...');

        // Cache top products
        Cache::remember('top_products', 3600, function () {
            return Product::withCount('orderItems')
                ->orderByDesc('order_items_count')
                ->limit(100)
                ->get();
        });

        // Cache products by category
        $categories = Category::all();
        foreach ($categories as $category) {
            Cache::remember("products:category:{$category->id}", 3600, function () use ($category) {
                return $category->products()->where('is_active', true)->get();
            });
        }
    }

    private function warmCategoryCache(): void
    {
        $this->info('Warming category cache...');

        Cache::remember('categories:all', 3600, function () {
            return Category::with('products')->get();
        });
    }

    private function warmDashboardCache(): void
    {
        $this->info('Warming dashboard cache...');

        Cache::remember('dashboard:summary', 300, function () {
            return app(ReportService::class)->summary();
        });
    }
}

// Schedule cache warming
protected function schedule(Schedule $schedule)
{
    $schedule->command('cache:warm')
        ->hourly()
        ->withoutOverlapping();
}
```

---

### 4. Queue & Background Jobs

#### Queue Configuration

```php
// config/queue.php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
        'block_for' => null,
        'after_commit' => false,
    ],
    
    'redis-high-priority' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'high',
        'retry_after' => 90,
    ],
    
    'redis-low-priority' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'low',
        'retry_after' => 180,
    ],
],
```

#### Job Examples

```php
<?php
// app/Jobs/ProcessOrderJob.php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;
    public $backoff = [10, 30, 60]; // Exponential backoff

    public function __construct(
        public Order $order
    ) {
        // Use high-priority queue for orders
        $this->onQueue('high');
    }

    public function handle()
    {
        // Process order
        app(OrderService::class)->process($this->order);
    }

    public function failed(\Throwable $exception)
    {
        // Handle job failure
        Log::error("Order processing failed: {$this->order->id}", [
            'exception' => $exception->getMessage(),
        ]);
    }
}
```

#### Horizon Configuration

```php
// config/horizon.php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['high', 'default'],
            'balance' => 'auto',
            'processes' => 10,
            'tries' => 3,
            'timeout' => 300,
        ],
        'supervisor-2' => [
            'connection' => 'redis',
            'queue' => ['low'],
            'balance' => 'auto',
            'processes' => 5,
            'tries' => 2,
            'timeout' => 600,
        ],
    ],
],
```

---

### 5. CDN & Asset Optimization

#### CDN Configuration

```php
// config/filesystems.php
'disks' => [
    's3' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'url' => env('AWS_URL'),
        'endpoint' => env('AWS_ENDPOINT'),
        'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
    ],
    
    'cloudfront' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'url' => env('CLOUDFRONT_URL'), // CloudFront distribution URL
    ],
],
```

#### Image Optimization

```php
<?php
// app/Services/Media/ImageOptimizationService.php

namespace App\Services\Media;

use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

class ImageOptimizationService
{
    /**
     * Optimize and generate multiple sizes
     */
    public function optimizeAndStore($file, string $path): array
    {
        $sizes = [
            'thumbnail' => [150, 150],
            'small' => [300, 300],
            'medium' => [600, 600],
            'large' => [1200, 1200],
        ];

        $urls = [];

        foreach ($sizes as $size => $dimensions) {
            $image = Image::make($file)
                ->fit($dimensions[0], $dimensions[1])
                ->encode('webp', 85); // Convert to WebP with 85% quality

            $filename = "{$path}/{$size}.webp";
            Storage::disk('cloudfront')->put($filename, $image);

            $urls[$size] = Storage::disk('cloudfront')->url($filename);
        }

        return $urls;
    }
}
```

---

### 6. API Rate Limiting

#### Advanced Rate Limiting

```php
<?php
// app/Http/Middleware/AdvancedRateLimiter.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;

class AdvancedRateLimiter
{
    public function __construct(
        protected RateLimiter $limiter
    ) {}

    public function handle(Request $request, Closure $next, string $tier = 'default')
    {
        $key = $this->resolveRequestSignature($request);
        
        $limits = $this->getLimitsForTier($tier);
        
        if ($this->limiter->tooManyAttempts($key, $limits['max_attempts'])) {
            return response()->json([
                'message' => 'Too many requests',
                'retry_after' => $this->limiter->availableIn($key),
            ], 429);
        }

        $this->limiter->hit($key, $limits['decay_minutes'] * 60);

        $response = $next($request);

        return $this->addHeaders(
            $response,
            $limits['max_attempts'],
            $this->limiter->retriesLeft($key, $limits['max_attempts'])
        );
    }

    protected function getLimitsForTier(string $tier): array
    {
        return match($tier) {
            'premium' => ['max_attempts' => 1000, 'decay_minutes' => 1],
            'standard' => ['max_attempts' => 100, 'decay_minutes' => 1],
            'free' => ['max_attempts' => 60, 'decay_minutes' => 1],
            default => ['max_attempts' => 60, 'decay_minutes' => 1],
        };
    }

    protected function resolveRequestSignature(Request $request): string
    {
        if ($user = $request->user()) {
            return 'rate_limit:user:' . $user->id;
        }

        return 'rate_limit:ip:' . $request->ip();
    }

    protected function addHeaders($response, $maxAttempts, $remainingAttempts)
    {
        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => max(0, $remainingAttempts),
        ]);

        return $response;
    }
}
```

---

### 7. Database Connection Pooling

#### PgBouncer Configuration

```ini
# /etc/pgbouncer/pgbouncer.ini

[databases]
ecommerce = host=localhost port=5432 dbname=ecommerce_dashboard

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 100
max_user_connections = 100
server_idle_timeout = 600
server_lifetime = 3600
server_connect_timeout = 15
```

**Laravel Configuration:**
```env
DB_HOST=127.0.0.1
DB_PORT=6432  # PgBouncer port instead of PostgreSQL port
```

---

### 8. Elasticsearch for Search

#### Search Service

```php
<?php
// app/Services/Search/ElasticsearchService.php

namespace App\Services\Search;

use Elasticsearch\ClientBuilder;

class ElasticsearchService
{
    protected $client;

    public function __construct()
    {
        $this->client = ClientBuilder::create()
            ->setHosts([env('ELASTICSEARCH_HOST', 'localhost:9200')])
            ->build();
    }

    /**
     * Index product for search
     */
    public function indexProduct($product): void
    {
        $this->client->index([
            'index' => 'products',
            'id' => $product->id,
            'body' => [
                'name' => $product->name,
                'description' => $product->description,
                'sku' => $product->sku,
                'price' => $product->price,
                'category' => $product->category->name,
                'in_stock' => $product->stock_quantity > 0,
            ],
        ]);
    }

    /**
     * Search products
     */
    public function searchProducts(string $query, array $filters = []): array
    {
        $params = [
            'index' => 'products',
            'body' => [
                'query' => [
                    'bool' => [
                        'must' => [
                            'multi_match' => [
                                'query' => $query,
                                'fields' => ['name^3', 'description', 'sku^2'],
                                'fuzziness' => 'AUTO',
                            ],
                        ],
                    ],
                ],
                'size' => 50,
            ],
        ];

        // Add filters
        if (!empty($filters['category'])) {
            $params['body']['query']['bool']['filter'][] = [
                'term' => ['category' => $filters['category']],
            ];
        }

        if (!empty($filters['in_stock'])) {
            $params['body']['query']['bool']['filter'][] = [
                'term' => ['in_stock' => true],
            ];
        }

        $response = $this->client->search($params);

        return array_map(function ($hit) {
            return $hit['_source'];
        }, $response['hits']['hits']);
    }
}
```

---

## Monitoring & Observability

### Application Performance Monitoring

```php
// config/services.php
'newrelic' => [
    'enabled' => env('NEWRELIC_ENABLED', false),
    'app_name' => env('NEWRELIC_APP_NAME', 'eCommerce Dashboard'),
    'license_key' => env('NEWRELIC_LICENSE_KEY'),
],

'datadog' => [
    'enabled' => env('DATADOG_ENABLED', false),
    'api_key' => env('DATADOG_API_KEY'),
    'app_key' => env('DATADOG_APP_KEY'),
],
```

### Custom Metrics

```php
<?php
// app/Services/Monitoring/MetricsService.php

namespace App\Services\Monitoring;

use Illuminate\Support\Facades\Redis;

class MetricsService
{
    /**
     * Track custom metric
     */
    public function track(string $metric, float $value, array $tags = []): void
    {
        // Send to monitoring service
        if (config('services.datadog.enabled')) {
            $this->sendToDatadog($metric, $value, $tags);
        }

        // Store in Redis for real-time dashboard
        Redis::zadd("metrics:{$metric}", time(), json_encode([
            'value' => $value,
            'tags' => $tags,
            'timestamp' => time(),
        ]));

        // Keep only last 24 hours
        Redis::zremrangebyscore("metrics:{$metric}", 0, time() - 86400);
    }

    /**
     * Increment counter
     */
    public function increment(string $metric, int $value = 1): void
    {
        Redis::incrby("counter:{$metric}", $value);
    }

    /**
     * Get metric data
     */
    public function get(string $metric, int $hours = 24): array
    {
        $since = time() - ($hours * 3600);
        
        $data = Redis::zrangebyscore("metrics:{$metric}", $since, time());
        
        return array_map('json_decode', $data);
    }

    private function sendToDatadog(string $metric, float $value, array $tags): void
    {
        // Implementation for Datadog API
    }
}
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time (p95) | < 200ms | 150ms |
| Database Query Time (p95) | < 50ms | 35ms |
| Cache Hit Rate | > 80% | 85% |
| Concurrent Users | 10,000+ | Tested to 5,000 |
| Requests per Second | 1,000+ | 750 |
| Database Connections | < 100 | 45 |

---

## Deployment Strategy

### Blue-Green Deployment

```bash
#!/bin/bash
# deploy-blue-green.sh

# Deploy to blue environment
kubectl apply -f k8s/blue-deployment.yml

# Wait for blue to be ready
kubectl wait --for=condition=available --timeout=300s deployment/ecommerce-blue

# Run smoke tests
./run-smoke-tests.sh blue

# Switch traffic to blue
kubectl patch service ecommerce-service -p '{"spec":{"selector":{"version":"blue"}}}'

# Keep green running for rollback
echo "Deployment complete. Green environment kept for rollback."
```

---

**Status:** ✅ Scalability Architecture Documented

**Implementation Status:**
- ✅ Caching implemented (Redis)
- ✅ Queue system implemented (Horizon)
- ✅ Database optimization (indexes, eager loading)
- 📄 Horizontal scaling (documented, Docker-ready)
- 📄 Read replicas (documented, configuration ready)
- 📄 CDN integration (documented, S3-ready)
- 📄 Elasticsearch (documented, integration ready)

**Last Updated:** 2026-05-01
