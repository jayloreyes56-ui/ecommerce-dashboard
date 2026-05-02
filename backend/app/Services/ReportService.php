<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Dashboard KPI summary — cached for 5 minutes.
     */
    public function dashboardSummary(): array
    {
        return Cache::remember('dashboard:summary', 300, function () {
            $today     = today();
            $thisMonth = now()->startOfMonth();
            $lastMonth = now()->subMonth()->startOfMonth();

            return [
                'revenue' => [
                    'today'      => $this->revenue($today, $today),
                    'this_month' => $this->revenue($thisMonth, now()),
                    'last_month' => $this->revenue($lastMonth, now()->subMonth()->endOfMonth()),
                ],
                'orders' => [
                    'today'      => Order::whereDate('placed_at', $today)->count(),
                    'this_month' => Order::where('placed_at', '>=', $thisMonth)->count(),
                    'pending'    => Order::byStatus('pending')->count(),
                    'processing' => Order::byStatus('processing')->count(),
                ],
                'customers' => [
                    'total'     => DB::table('customers')->whereNull('deleted_at')->count(),
                    'new_today' => DB::table('customers')->whereDate('created_at', $today)->count(),
                ],
                'low_stock_count' => Product::lowStock()->count(),
            ];
        });
    }

    /**
     * Sales chart data grouped by day/week/month.
     */
    public function salesChart(string $from, string $to, string $groupBy = 'day'): array
    {
        $cacheKey = "report:sales_chart:{$from}:{$to}:{$groupBy}";

        return Cache::remember($cacheKey, 600, function () use ($from, $to, $groupBy) {
            // PostgreSQL-compatible date formatting
            $format = match ($groupBy) {
                'week'  => 'IYYY-IW',    // ISO Year-Week
                'month' => 'YYYY-MM',    // Year-Month
                default => 'YYYY-MM-DD', // Year-Month-Day
            };

            // Use string interpolation for format (safe - values are hardcoded above)
            return DB::table('orders')
                ->selectRaw("TO_CHAR(placed_at, '{$format}') as period, COUNT(*) as order_count, SUM(total) as revenue")
                ->where('placed_at', '>=', $from)
                ->where('placed_at', '<=', $to . ' 23:59:59')
                ->whereNotIn('status', ['cancelled', 'refunded'])
                ->whereNull('deleted_at')
                ->groupByRaw("TO_CHAR(placed_at, '{$format}')")
                ->orderBy('period')
                ->get()
                ->toArray();
        });
    }

    /**
     * Top-selling products by revenue or quantity.
     */
    public function topProducts(string $from, string $to, int $limit = 10, string $metric = 'revenue'): array
    {
        $orderBy = $metric === 'quantity' ? 'total_quantity' : 'total_revenue';

        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->selectRaw('
                products.id,
                products.name,
                products.sku,
                SUM(order_items.quantity) as total_quantity,
                SUM(order_items.total_price) as total_revenue
            ')
            ->where('orders.placed_at', '>=', $from)
            ->where('orders.placed_at', '<=', $to . ' 23:59:59')
            ->whereNotIn('orders.status', ['cancelled', 'refunded'])
            ->whereNull('orders.deleted_at')
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc($orderBy)
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Sales report with detailed breakdown.
     */
    public function salesReport(string $from, string $to, string $groupBy = 'day'): array
    {
        $chart    = $this->salesChart($from, $to, $groupBy);
        $products = $this->topProducts($from, $to, 20);

        $summary = DB::table('orders')
            ->where('placed_at', '>=', $from)
            ->where('placed_at', '<=', $to . ' 23:59:59')
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->whereNull('deleted_at')
            ->selectRaw('
                COUNT(*) as total_orders,
                SUM(total) as total_revenue,
                AVG(total) as avg_order_value,
                SUM(discount) as total_discounts,
                SUM(tax) as total_tax,
                SUM(shipping_cost) as total_shipping
            ')
            ->first();

        return [
            'summary'  => $summary,
            'chart'    => $chart,
            'products' => $products,
        ];
    }

    /**
     * Customer report — top customers by spend.
     */
    public function customerReport(string $from, string $to, int $limit = 20): array
    {
        return DB::table('orders')
            ->join('customers', 'customers.id', '=', 'orders.customer_id')
            ->selectRaw('
                customers.id,
                customers.name,
                customers.email,
                COUNT(orders.id) as order_count,
                SUM(orders.total) as total_spent,
                AVG(orders.total) as avg_order_value,
                MAX(orders.placed_at) as last_order_at
            ')
            ->where('orders.placed_at', '>=', $from)
            ->where('orders.placed_at', '<=', $to . ' 23:59:59')
            ->whereNotIn('orders.status', ['cancelled', 'refunded'])
            ->whereNull('orders.deleted_at')
            ->groupBy('customers.id', 'customers.name', 'customers.email')
            ->orderByDesc('total_spent')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function revenue($from, $to): float
    {
        return (float) Order::whereNotIn('status', ['cancelled', 'refunded'])
            ->where('placed_at', '>=', $from)
            ->where('placed_at', '<=', $to)
            ->sum('total');
    }

    /**
     * Export data to CSV file.
     */
    public function exportToCsv($data, string $filename, array $headers = [])
    {
        $callback = function () use ($data, $headers) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 support
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Write headers
            if (!empty($headers)) {
                fputcsv($file, $headers);
            }

            // Write data
            foreach ($data as $row) {
                fputcsv($file, (array) $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
            'Pragma'              => 'no-cache',
            'Expires'             => '0',
        ]);
    }
}
