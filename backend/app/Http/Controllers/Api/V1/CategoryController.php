<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * GET /api/v1/categories
     */
    public function index(Request $request): JsonResponse
    {
        // Cache the category tree for 1 hour
        $categories = Cache::remember('categories:tree', 3600, function () {
            return Category::with('children')
                ->roots()
                ->active()
                ->orderBy('sort_order')
                ->get();
        });

        return response()->json([
            'success' => true,
            'data'    => CategoryResource::collection($categories),
        ]);
    }

    /**
     * POST /api/v1/categories
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $validated = $request->validate([
            'parent_id'   => ['nullable', 'integer', 'exists:categories,id'],
            'name'        => ['required', 'string', 'max:100'],
            'slug'        => ['nullable', 'string', 'max:120', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['boolean'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = Category::create($validated);

        Cache::forget('categories:tree');

        return response()->json([
            'success' => true,
            'data'    => new CategoryResource($category),
            'message' => 'Category created.',
        ], 201);
    }

    /**
     * PUT /api/v1/categories/{category}
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'parent_id'   => ['nullable', 'integer', 'exists:categories,id', "not_in:{$category->id}"],
            'name'        => ['sometimes', 'string', 'max:100'],
            'slug'        => ['sometimes', 'string', 'max:120', "unique:categories,slug,{$category->id}"],
            'description' => ['nullable', 'string'],
            'is_active'   => ['boolean'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ]);

        $category->update($validated);

        Cache::forget('categories:tree');

        return response()->json([
            'success' => true,
            'data'    => new CategoryResource($category->fresh(['parent', 'children'])),
            'message' => 'Category updated.',
        ]);
    }

    /**
     * DELETE /api/v1/categories/{category}
     */
    public function destroy(Category $category): JsonResponse
    {
        $this->authorize('delete', $category);

        if ($category->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a category that has products.',
            ], 422);
        }

        $category->delete();

        Cache::forget('categories:tree');

        return response()->json([
            'success' => true,
            'message' => 'Category deleted.',
        ]);
    }
}
