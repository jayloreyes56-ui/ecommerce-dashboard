<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * GET /api/v1/customers
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Customer::class);

        $customers = Customer::query()
            ->when($request->search, fn ($q) => $q->search($request->search))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy($request->input('sort_by', 'created_at'), $request->input('sort_dir', 'desc'))
            ->paginate($request->integer('per_page', 25));

        return response()->json([
            'success' => true,
            'data'    => CustomerResource::collection($customers),
            'meta'    => [
                'current_page' => $customers->currentPage(),
                'per_page'     => $customers->perPage(),
                'total'        => $customers->total(),
            ],
        ]);
    }

    /**
     * POST /api/v1/customers
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Customer::class);

        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:150'],
            'email'   => ['required', 'email', 'max:150', 'unique:customers,email'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'array'],
            'notes'   => ['nullable', 'string'],
        ]);

        $customer = Customer::create($validated);

        return response()->json([
            'success' => true,
            'data'    => new CustomerResource($customer),
            'message' => 'Customer created.',
        ], 201);
    }

    /**
     * GET /api/v1/customers/{customer}
     */
    public function show(Customer $customer): JsonResponse
    {
        $this->authorize('view', $customer);

        return response()->json([
            'success' => true,
            'data'    => new CustomerResource($customer),
        ]);
    }

    /**
     * PUT /api/v1/customers/{customer}
     */
    public function update(Request $request, Customer $customer): JsonResponse
    {
        $this->authorize('update', $customer);

        $validated = $request->validate([
            'name'    => ['sometimes', 'string', 'max:150'],
            'email'   => ['sometimes', 'email', 'max:150', "unique:customers,email,{$customer->id}"],
            'phone'   => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'array'],
            'status'  => ['sometimes', 'string', 'in:active,blocked'],
            'notes'   => ['nullable', 'string'],
        ]);

        $customer->update($validated);

        return response()->json([
            'success' => true,
            'data'    => new CustomerResource($customer->fresh()),
            'message' => 'Customer updated.',
        ]);
    }

    /**
     * GET /api/v1/customers/{customer}/orders
     */
    public function orders(Request $request, Customer $customer): JsonResponse
    {
        $this->authorize('view', $customer);

        $orders = $customer->orders()
            ->with(['items'])
            ->orderBy('placed_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => OrderResource::collection($orders),
            'meta'    => [
                'current_page' => $orders->currentPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }
}
