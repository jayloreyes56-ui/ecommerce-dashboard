# Dynamic Pricing Systems

## Overview

This document outlines the advanced pricing systems implemented in the eCommerce Dashboard, including dynamic pricing, tiered pricing, promotional pricing, and pricing rules engine.

---

## Table of Contents

1. [Pricing Architecture](#pricing-architecture)
2. [Dynamic Pricing](#dynamic-pricing)
3. [Tiered Pricing](#tiered-pricing)
4. [Promotional Pricing](#promotional-pricing)
5. [Pricing Rules Engine](#pricing-rules-engine)
6. [Implementation](#implementation)

---

## Pricing Architecture

### Database Schema

```sql
-- Price history tracking
CREATE TABLE price_history (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255),
    changed_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Pricing rules
CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'dynamic', 'tiered', 'promotional'
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer-specific pricing
CREATE TABLE customer_pricing (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    product_id BIGINT,
    category_id BIGINT,
    discount_type VARCHAR(20), -- 'percentage', 'fixed'
    discount_value DECIMAL(10,2),
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Volume-based pricing tiers
CREATE TABLE pricing_tiers (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    min_quantity INT NOT NULL,
    max_quantity INT,
    price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## Dynamic Pricing

### 1. Demand-Based Pricing

**Purpose:** Adjust prices based on demand, inventory levels, and market conditions.

**Implementation:**
```php
<?php
// app/Services/Pricing/DynamicPricingService.php

namespace App\Services\Pricing;

use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DynamicPricingService
{
    /**
     * Calculate dynamic price for a product
     */
    public function calculateDynamicPrice(Product $product, array $context = []): float
    {
        $basePrice = $product->price;
        
        // Apply various pricing factors
        $demandFactor = $this->calculateDemandFactor($product);
        $inventoryFactor = $this->calculateInventoryFactor($product);
        $competitorFactor = $this->calculateCompetitorFactor($product);
        $timeFactor = $this->calculateTimeFactor();
        
        // Calculate adjusted price
        $adjustedPrice = $basePrice * 
            $demandFactor * 
            $inventoryFactor * 
            $competitorFactor * 
            $timeFactor;
        
        // Apply min/max constraints
        $minPrice = $product->cost * 1.1; // Minimum 10% margin
        $maxPrice = $basePrice * 1.5; // Maximum 50% increase
        
        $finalPrice = max($minPrice, min($maxPrice, $adjustedPrice));
        
        // Log price calculation
        $this->logPriceCalculation($product, [
            'base_price' => $basePrice,
            'demand_factor' => $demandFactor,
            'inventory_factor' => $inventoryFactor,
            'competitor_factor' => $competitorFactor,
            'time_factor' => $timeFactor,
            'final_price' => $finalPrice,
        ]);
        
        return round($finalPrice, 2);
    }

    /**
     * Calculate demand factor based on recent sales
     */
    private function calculateDemandFactor(Product $product): float
    {
        $cacheKey = "demand_factor:product:{$product->id}";
        
        return Cache::remember($cacheKey, 3600, function () use ($product) {
            // Get sales in last 7 days vs previous 7 days
            $recentSales = $this->getSalesCount($product, 7);
            $previousSales = $this->getSalesCount($product, 14, 7);
            
            if ($previousSales == 0) {
                return 1.0; // No change if no historical data
            }
            
            $growthRate = ($recentSales - $previousSales) / $previousSales;
            
            // High demand = increase price (up to 20%)
            // Low demand = decrease price (up to 10%)
            if ($growthRate > 0.5) {
                return 1.2; // 20% increase
            } elseif ($growthRate > 0.2) {
                return 1.1; // 10% increase
            } elseif ($growthRate < -0.5) {
                return 0.9; // 10% decrease
            } elseif ($growthRate < -0.2) {
                return 0.95; // 5% decrease
            }
            
            return 1.0; // No change
        });
    }

    /**
     * Calculate inventory factor based on stock levels
     */
    private function calculateInventoryFactor(Product $product): float
    {
        $stockRatio = $product->stock_quantity / max($product->low_stock_threshold, 1);
        
        if ($stockRatio < 0.5) {
            // Very low stock - increase price
            return 1.15; // 15% increase
        } elseif ($stockRatio < 1.0) {
            // Low stock - slight increase
            return 1.05; // 5% increase
        } elseif ($stockRatio > 5.0) {
            // Excess stock - decrease price
            return 0.9; // 10% decrease
        } elseif ($stockRatio > 3.0) {
            // High stock - slight decrease
            return 0.95; // 5% decrease
        }
        
        return 1.0; // Normal stock level
    }

    /**
     * Calculate competitor factor (placeholder for competitor price monitoring)
     */
    private function calculateCompetitorFactor(Product $product): float
    {
        // In production, integrate with competitor price monitoring service
        // For now, return neutral factor
        
        $competitorPrices = $this->getCompetitorPrices($product);
        
        if (empty($competitorPrices)) {
            return 1.0;
        }
        
        $avgCompetitorPrice = array_sum($competitorPrices) / count($competitorPrices);
        $ourPrice = $product->price;
        
        if ($ourPrice > $avgCompetitorPrice * 1.1) {
            // We're 10% more expensive - decrease price
            return 0.95;
        } elseif ($ourPrice < $avgCompetitorPrice * 0.9) {
            // We're 10% cheaper - can increase price
            return 1.05;
        }
        
        return 1.0;
    }

    /**
     * Calculate time-based factor (peak hours, seasons, etc.)
     */
    private function calculateTimeFactor(): float
    {
        $hour = Carbon::now()->hour;
        $dayOfWeek = Carbon::now()->dayOfWeek;
        
        // Peak hours (10 AM - 8 PM) on weekdays
        if ($dayOfWeek >= 1 && $dayOfWeek <= 5 && $hour >= 10 && $hour <= 20) {
            return 1.05; // 5% increase during peak hours
        }
        
        // Weekend premium
        if ($dayOfWeek == 0 || $dayOfWeek == 6) {
            return 1.03; // 3% increase on weekends
        }
        
        return 1.0;
    }

    private function getSalesCount(Product $product, int $days, int $offset = 0): int
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.product_id', $product->id)
            ->where('orders.created_at', '>=', Carbon::now()->subDays($days + $offset))
            ->where('orders.created_at', '<', Carbon::now()->subDays($offset))
            ->sum('order_items.quantity');
    }

    private function getCompetitorPrices(Product $product): array
    {
        // Integrate with competitor price monitoring API
        // Example: Prisync, Competera, or custom scraper
        return [];
    }

    private function logPriceCalculation(Product $product, array $data): void
    {
        DB::table('price_calculations')->insert([
            'product_id' => $product->id,
            'calculation_data' => json_encode($data),
            'created_at' => now(),
        ]);
    }
}
```

---

## Tiered Pricing

### Volume-Based Discounts

**Purpose:** Offer discounts based on quantity purchased.

**Implementation:**
```php
<?php
// app/Services/Pricing/TieredPricingService.php

namespace App\Services\Pricing;

use App\Models\Product;
use App\Models\PricingTier;

class TieredPricingService
{
    /**
     * Calculate price based on quantity (volume discount)
     */
    public function calculateTieredPrice(Product $product, int $quantity): array
    {
        $tiers = PricingTier::where('product_id', $product->id)
            ->orderBy('min_quantity')
            ->get();
        
        if ($tiers->isEmpty()) {
            // No tiers defined, use base price
            return [
                'unit_price' => $product->price,
                'total_price' => $product->price * $quantity,
                'discount_percentage' => 0,
                'savings' => 0,
                'tier' => null,
            ];
        }
        
        // Find applicable tier
        $applicableTier = null;
        foreach ($tiers as $tier) {
            if ($quantity >= $tier->min_quantity) {
                if ($tier->max_quantity === null || $quantity <= $tier->max_quantity) {
                    $applicableTier = $tier;
                }
            }
        }
        
        if ($applicableTier) {
            $unitPrice = $applicableTier->price;
            $totalPrice = $unitPrice * $quantity;
            $regularTotal = $product->price * $quantity;
            $savings = $regularTotal - $totalPrice;
            
            return [
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'discount_percentage' => $applicableTier->discount_percentage,
                'savings' => $savings,
                'tier' => [
                    'min_quantity' => $applicableTier->min_quantity,
                    'max_quantity' => $applicableTier->max_quantity,
                ],
            ];
        }
        
        // No applicable tier
        return [
            'unit_price' => $product->price,
            'total_price' => $product->price * $quantity,
            'discount_percentage' => 0,
            'savings' => 0,
            'tier' => null,
        ];
    }

    /**
     * Get all pricing tiers for a product
     */
    public function getTiers(Product $product): array
    {
        return PricingTier::where('product_id', $product->id)
            ->orderBy('min_quantity')
            ->get()
            ->map(function ($tier) use ($product) {
                return [
                    'min_quantity' => $tier->min_quantity,
                    'max_quantity' => $tier->max_quantity,
                    'price' => $tier->price,
                    'discount_percentage' => $tier->discount_percentage,
                    'savings_per_unit' => $product->price - $tier->price,
                ];
            })
            ->toArray();
    }

    /**
     * Create pricing tiers for a product
     */
    public function createTiers(Product $product, array $tiers): void
    {
        // Delete existing tiers
        PricingTier::where('product_id', $product->id)->delete();
        
        // Create new tiers
        foreach ($tiers as $tier) {
            PricingTier::create([
                'product_id' => $product->id,
                'min_quantity' => $tier['min_quantity'],
                'max_quantity' => $tier['max_quantity'] ?? null,
                'price' => $tier['price'],
                'discount_percentage' => $tier['discount_percentage'] ?? 0,
            ]);
        }
    }
}

// Example usage in OrderController
public function calculateOrderTotal(Request $request)
{
    $tieredPricingService = app(TieredPricingService::class);
    $total = 0;
    $items = [];
    
    foreach ($request->items as $item) {
        $product = Product::findOrFail($item['product_id']);
        $pricing = $tieredPricingService->calculateTieredPrice(
            $product,
            $item['quantity']
        );
        
        $items[] = [
            'product' => $product,
            'quantity' => $item['quantity'],
            'pricing' => $pricing,
        ];
        
        $total += $pricing['total_price'];
    }
    
    return response()->json([
        'items' => $items,
        'subtotal' => $total,
        'total_savings' => array_sum(array_column($items, 'pricing.savings')),
    ]);
}
```

---

## Promotional Pricing

### Discount Codes & Promotions

**Implementation:**
```php
<?php
// app/Services/Pricing/PromotionalPricingService.php

namespace App\Services\Pricing;

use App\Models\Promotion;
use App\Models\Customer;
use Carbon\Carbon;

class PromotionalPricingService
{
    /**
     * Apply promotional discount to order
     */
    public function applyPromotion(string $code, float $subtotal, ?Customer $customer = null): array
    {
        $promotion = Promotion::where('code', $code)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', Carbon::now());
            })
            ->where(function ($query) {
                $query->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', Carbon::now());
            })
            ->first();
        
        if (!$promotion) {
            return [
                'valid' => false,
                'error' => 'Invalid or expired promotion code',
            ];
        }
        
        // Check usage limits
        if ($promotion->max_uses && $promotion->times_used >= $promotion->max_uses) {
            return [
                'valid' => false,
                'error' => 'Promotion code has reached maximum usage',
            ];
        }
        
        // Check customer-specific restrictions
        if ($promotion->customer_id && (!$customer || $customer->id !== $promotion->customer_id)) {
            return [
                'valid' => false,
                'error' => 'This promotion is not valid for your account',
            ];
        }
        
        // Check minimum order value
        if ($promotion->min_order_value && $subtotal < $promotion->min_order_value) {
            return [
                'valid' => false,
                'error' => "Minimum order value of \${$promotion->min_order_value} required",
            ];
        }
        
        // Calculate discount
        $discount = 0;
        if ($promotion->discount_type === 'percentage') {
            $discount = $subtotal * ($promotion->discount_value / 100);
            if ($promotion->max_discount_amount) {
                $discount = min($discount, $promotion->max_discount_amount);
            }
        } elseif ($promotion->discount_type === 'fixed') {
            $discount = min($promotion->discount_value, $subtotal);
        } elseif ($promotion->discount_type === 'free_shipping') {
            // Handle in shipping calculation
            $discount = 0;
        }
        
        return [
            'valid' => true,
            'promotion' => $promotion,
            'discount' => round($discount, 2),
            'final_total' => round($subtotal - $discount, 2),
        ];
    }

    /**
     * Get active promotions for customer
     */
    public function getActivePromotions(?Customer $customer = null): array
    {
        $query = Promotion::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_from')
                  ->orWhere('valid_from', '<=', Carbon::now());
            })
            ->where(function ($q) {
                $q->whereNull('valid_until')
                  ->orWhere('valid_until', '>=', Carbon::now());
            })
            ->where(function ($q) {
                $q->whereNull('max_uses')
                  ->orWhereRaw('times_used < max_uses');
            });
        
        if ($customer) {
            $query->where(function ($q) use ($customer) {
                $q->whereNull('customer_id')
                  ->orWhere('customer_id', $customer->id);
            });
        } else {
            $query->whereNull('customer_id');
        }
        
        return $query->get()->toArray();
    }

    /**
     * Create automatic promotions based on rules
     */
    public function createAutomaticPromotions(): void
    {
        // Example: Create promotion for customers who haven't ordered in 30 days
        $inactiveCustomers = Customer::whereHas('orders', function ($query) {
            $query->where('created_at', '<', Carbon::now()->subDays(30));
        })->get();
        
        foreach ($inactiveCustomers as $customer) {
            Promotion::create([
                'code' => 'COMEBACK-' . strtoupper(substr($customer->email, 0, 5)),
                'name' => 'Welcome Back Offer',
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'customer_id' => $customer->id,
                'valid_from' => Carbon::now(),
                'valid_until' => Carbon::now()->addDays(7),
                'max_uses' => 1,
                'is_active' => true,
            ]);
        }
    }
}
```

---

## Pricing Rules Engine

### Flexible Rule-Based Pricing

**Implementation:**
```php
<?php
// app/Services/Pricing/PricingRulesEngine.php

namespace App\Services\Pricing;

use App\Models\Product;
use App\Models\Customer;
use App\Models\PricingRule;

class PricingRulesEngine
{
    /**
     * Apply all applicable pricing rules
     */
    public function applyRules(Product $product, ?Customer $customer = null, array $context = []): float
    {
        $basePrice = $product->price;
        
        // Get all active rules sorted by priority
        $rules = PricingRule::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', now());
            })
            ->orderBy('priority', 'desc')
            ->get();
        
        $finalPrice = $basePrice;
        $appliedRules = [];
        
        foreach ($rules as $rule) {
            if ($this->evaluateConditions($rule->conditions, $product, $customer, $context)) {
                $finalPrice = $this->applyActions($rule->actions, $finalPrice, $basePrice);
                $appliedRules[] = $rule->name;
            }
        }
        
        return round($finalPrice, 2);
    }

    /**
     * Evaluate rule conditions
     */
    private function evaluateConditions(array $conditions, Product $product, ?Customer $customer, array $context): bool
    {
        foreach ($conditions as $condition) {
            $type = $condition['type'];
            $operator = $condition['operator'];
            $value = $condition['value'];
            
            switch ($type) {
                case 'product_category':
                    if (!$this->compareValues($product->category_id, $operator, $value)) {
                        return false;
                    }
                    break;
                    
                case 'product_price':
                    if (!$this->compareValues($product->price, $operator, $value)) {
                        return false;
                    }
                    break;
                    
                case 'customer_type':
                    if (!$customer || !$this->compareValues($customer->type, $operator, $value)) {
                        return false;
                    }
                    break;
                    
                case 'customer_total_spent':
                    if (!$customer) return false;
                    $totalSpent = $customer->orders->sum('total');
                    if (!$this->compareValues($totalSpent, $operator, $value)) {
                        return false;
                    }
                    break;
                    
                case 'day_of_week':
                    if (!$this->compareValues(now()->dayOfWeek, $operator, $value)) {
                        return false;
                    }
                    break;
                    
                case 'time_of_day':
                    if (!$this->compareValues(now()->hour, $operator, $value)) {
                        return false;
                    }
                    break;
                    
                case 'stock_level':
                    if (!$this->compareValues($product->stock_quantity, $operator, $value)) {
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    }

    /**
     * Apply rule actions
     */
    private function applyActions(array $actions, float $currentPrice, float $basePrice): float
    {
        foreach ($actions as $action) {
            $type = $action['type'];
            $value = $action['value'];
            
            switch ($type) {
                case 'percentage_discount':
                    $currentPrice = $currentPrice * (1 - $value / 100);
                    break;
                    
                case 'fixed_discount':
                    $currentPrice = max(0, $currentPrice - $value);
                    break;
                    
                case 'set_price':
                    $currentPrice = $value;
                    break;
                    
                case 'percentage_markup':
                    $currentPrice = $currentPrice * (1 + $value / 100);
                    break;
            }
        }
        
        return $currentPrice;
    }

    /**
     * Compare values based on operator
     */
    private function compareValues($actual, string $operator, $expected): bool
    {
        switch ($operator) {
            case '==': return $actual == $expected;
            case '!=': return $actual != $expected;
            case '>': return $actual > $expected;
            case '>=': return $actual >= $expected;
            case '<': return $actual < $expected;
            case '<=': return $actual <= $expected;
            case 'in': return in_array($actual, (array) $expected);
            case 'not_in': return !in_array($actual, (array) $expected);
            default: return false;
        }
    }
}
```

---

## API Endpoints

### Pricing API

```php
// routes/api.php

// Get dynamic price for product
Route::get('products/{product}/price', [PricingController::class, 'getDynamicPrice']);

// Get tiered pricing
Route::get('products/{product}/tiers', [PricingController::class, 'getTiers']);

// Calculate order total with pricing
Route::post('orders/calculate', [PricingController::class, 'calculateTotal']);

// Apply promotion code
Route::post('promotions/apply', [PricingController::class, 'applyPromotion']);

// Get active promotions
Route::get('promotions/active', [PricingController::class, 'getActivePromotions']);
```

---

## Configuration

```php
// config/pricing.php

return [
    'dynamic_pricing' => [
        'enabled' => env('DYNAMIC_PRICING_ENABLED', false),
        'update_frequency' => env('DYNAMIC_PRICING_UPDATE_FREQUENCY', 3600), // seconds
        'max_increase' => 0.5, // 50%
        'max_decrease' => 0.3, // 30%
    ],
    
    'tiered_pricing' => [
        'enabled' => env('TIERED_PRICING_ENABLED', true),
    ],
    
    'promotional_pricing' => [
        'enabled' => env('PROMOTIONAL_PRICING_ENABLED', true),
        'allow_stacking' => env('ALLOW_PROMOTION_STACKING', false),
    ],
    
    'rules_engine' => [
        'enabled' => env('PRICING_RULES_ENABLED', true),
    ],
];
```

---

## Monitoring & Analytics

### Price Change Tracking

```php
// Track all price changes
public function updatePrice(Product $product, float $newPrice, string $reason)
{
    $oldPrice = $product->price;
    
    $product->update(['price' => $newPrice]);
    
    // Log price change
    DB::table('price_history')->insert([
        'product_id' => $product->id,
        'old_price' => $oldPrice,
        'new_price' => $newPrice,
        'reason' => $reason,
        'changed_by' => auth()->id(),
        'created_at' => now(),
    ]);
    
    // Notify if significant change
    if (abs($newPrice - $oldPrice) / $oldPrice > 0.1) {
        event(new SignificantPriceChange($product, $oldPrice, $newPrice));
    }
}
```

---

**Status:** ✅ Architecture Documented & Implementation Provided

**Note:** Dynamic pricing requires configuration and monitoring. The system is designed to be flexible and can integrate with external pricing intelligence services.

**Last Updated:** 2026-05-01
