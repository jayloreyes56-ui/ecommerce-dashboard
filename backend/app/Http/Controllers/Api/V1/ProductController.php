<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\AdjustStockRequest;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\InventoryResource;
use App\Http\Resources\ProductResource;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService
    ) {}

    /**
     * GET /api/v1/products
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        $products = $this->productService->list($request->only([
            'search', 'category_id', 'is_active', 'low_stock',
            'sort_by', 'sort_dir', 'per_page',
        ]));

        return response()->json([
            'success' => true,
            'data'    => ProductResource::collection($products),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
                'last_page'    => $products->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/products
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->create($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product),
            'message' => 'Product created successfully.',
        ], 201);
    }

    /**
     * GET /api/v1/products/{product}
     */
    public function show(Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        $product->load(['category', 'inventory']);

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product),
        ]);
    }

    /**
     * PUT /api/v1/products/{product}
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product = $this->productService->update($product, $request->validated());

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product),
            'message' => 'Product updated successfully.',
        ]);
    }

    /**
     * DELETE /api/v1/products/{product}
     */
    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        $this->productService->delete($product);

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }

    /**
     * POST /api/v1/products/bulk-delete
     * Bulk delete products
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $this->authorize('delete', Product::class);

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:products,id'],
        ]);

        $deleted = 0;
        $failed = [];

        foreach ($validated['ids'] as $id) {
            try {
                $product = Product::findOrFail($id);
                $this->productService->delete($product);
                $deleted++;
            } catch (\Exception $e) {
                $failed[] = [
                    'id' => $id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => "{$deleted} product(s) deleted successfully.",
            'data' => [
                'deleted' => $deleted,
                'failed' => count($failed),
                'errors' => $failed,
            ],
        ]);
    }

    /**
     * POST /api/v1/products/{product}/stock
     * Adjust inventory stock manually.
     */
    public function adjustStock(AdjustStockRequest $request, Product $product): JsonResponse
    {
        $inventory = $this->productService->adjustStock(
            product: $product,
            change: $request->change,
            reason: $request->reason,
            note: $request->note,
            user: $request->user()
        );

        return response()->json([
            'success' => true,
            'data'    => new InventoryResource($inventory),
            'message' => 'Stock adjusted successfully.',
        ]);
    }

    /**
     * GET /api/v1/products/{product}/stock/logs
     */
    public function stockLogs(Request $request, Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        $logs = InventoryLog::where('product_id', $product->id)
            ->with(['user', 'order'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => $logs->items(),
            'meta'    => [
                'current_page' => $logs->currentPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }

    /**
     * POST /api/v1/products/{product}/images
     */
    public function uploadImages(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $request->validate([
            'images'   => ['required', 'array', 'min:1'],
            'images.*' => ['image', 'max:5120'], // 5MB
        ]);

        $product = $this->productService->uploadImages($product, $request->file('images'));

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product),
            'message' => 'Images uploaded successfully.',
        ]);
    }
}
