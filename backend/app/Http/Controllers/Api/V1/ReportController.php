<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService
    ) {}

    /**
     * GET /api/v1/dashboard/summary
     */
    public function summary(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->reportService->dashboardSummary(),
        ]);
    }

    /**
     * GET /api/v1/dashboard/sales-chart
     */
    public function salesChart(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from'     => ['required', 'date'],
            'to'       => ['required', 'date', 'after_or_equal:from'],
            'group_by' => ['nullable', 'string', 'in:day,week,month'],
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->reportService->salesChart(
                from: $validated['from'],
                to: $validated['to'],
                groupBy: $validated['group_by'] ?? 'day'
            ),
        ]);
    }

    /**
     * GET /api/v1/dashboard/top-products
     */
    public function topProducts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from'   => ['required', 'date'],
            'to'     => ['required', 'date', 'after_or_equal:from'],
            'limit'  => ['nullable', 'integer', 'min:1', 'max:50'],
            'metric' => ['nullable', 'string', 'in:revenue,quantity'],
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->reportService->topProducts(
                from: $validated['from'],
                to: $validated['to'],
                limit: $validated['limit'] ?? 10,
                metric: $validated['metric'] ?? 'revenue'
            ),
        ]);
    }

    /**
     * GET /api/v1/reports/sales
     */
    public function sales(Request $request): JsonResponse
    {
        $this->authorize('view-reports');

        $validated = $request->validate([
            'from'     => ['required', 'date'],
            'to'       => ['required', 'date', 'after_or_equal:from'],
            'group_by' => ['nullable', 'string', 'in:day,week,month'],
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->reportService->salesReport(
                from: $validated['from'],
                to: $validated['to'],
                groupBy: $validated['group_by'] ?? 'day'
            ),
        ]);
    }

    /**
     * GET /api/v1/reports/sales/export
     * Export sales report as CSV
     */
    public function exportSales(Request $request)
    {
        $this->authorize('export-reports');

        $validated = $request->validate([
            'from'     => ['required', 'date'],
            'to'       => ['required', 'date', 'after_or_equal:from'],
            'group_by' => ['nullable', 'string', 'in:day,week,month'],
        ]);

        $data = $this->reportService->salesReport(
            from: $validated['from'],
            to: $validated['to'],
            groupBy: $validated['group_by'] ?? 'day'
        );

        $filename = 'sales_report_' . $validated['from'] . '_to_' . $validated['to'] . '.csv';

        return $this->reportService->exportToCsv($data, $filename, [
            'Period',
            'Orders',
            'Revenue',
            'Average Order Value',
        ]);
    }

    /**
     * GET /api/v1/reports/customers
     */
    public function customers(Request $request): JsonResponse
    {
        $this->authorize('view-reports');

        $validated = $request->validate([
            'from'  => ['required', 'date'],
            'to'    => ['required', 'date', 'after_or_equal:from'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->reportService->customerReport(
                from: $validated['from'],
                to: $validated['to'],
                limit: $validated['limit'] ?? 20
            ),
        ]);
    }

    /**
     * GET /api/v1/reports/customers/export
     * Export customer report as CSV
     */
    public function exportCustomers(Request $request)
    {
        $this->authorize('export-reports');

        $validated = $request->validate([
            'from'  => ['required', 'date'],
            'to'    => ['required', 'date', 'after_or_equal:from'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:1000'],
        ]);

        $data = $this->reportService->customerReport(
            from: $validated['from'],
            to: $validated['to'],
            limit: $validated['limit'] ?? 1000
        );

        $filename = 'customer_report_' . $validated['from'] . '_to_' . $validated['to'] . '.csv';

        return $this->reportService->exportToCsv($data, $filename, [
            'Customer Name',
            'Email',
            'Total Orders',
            'Total Spent',
            'Average Order Value',
            'Last Order Date',
        ]);
    }

    /**
     * GET /api/v1/reports/products/export
     * Export products as CSV
     */
    public function exportProducts(Request $request)
    {
        $this->authorize('view-products');

        $products = \App\Models\Product::with(['category', 'inventory'])
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->is_active !== null, fn($q) => $q->where('is_active', $request->is_active))
            ->get()
            ->map(fn($p) => [
                'SKU' => $p->sku,
                'Name' => $p->name,
                'Category' => $p->category?->name ?? 'N/A',
                'Price' => $p->price,
                'Cost Price' => $p->cost_price ?? 0,
                'Stock' => $p->inventory?->quantity ?? 0,
                'Reserved' => $p->inventory?->reserved ?? 0,
                'Available' => $p->inventory?->available ?? 0,
                'Status' => $p->is_active ? 'Active' : 'Inactive',
            ]);

        $filename = 'products_export_' . now()->format('Y-m-d') . '.csv';

        return $this->reportService->exportToCsv($products, $filename, [
            'SKU',
            'Name',
            'Category',
            'Price',
            'Cost Price',
            'Stock',
            'Reserved',
            'Available',
            'Status',
        ]);
    }
}
