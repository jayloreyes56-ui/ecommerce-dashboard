<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    /**
     * GET /api/v1/orders
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $orders = $this->orderService->list($request->only([
            'search', 'status', 'payment_status', 'customer_id',
            'from', 'to', 'sort_by', 'sort_dir', 'per_page',
        ]));

        return response()->json([
            'success' => true,
            'data'    => OrderResource::collection($orders),
            'meta'    => [
                'current_page' => $orders->currentPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
                'last_page'    => $orders->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/orders
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->create($request->validated(), $request->user());

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
            'message' => 'Order created successfully.',
        ], 201);
    }

    /**
     * GET /api/v1/orders/{order}
     */
    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load(['customer', 'items.product', 'assignedTo', 'statusHistory.changedBy']);

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
        ]);
    }

    /**
     * PATCH /api/v1/orders/{order}/status
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $order = $this->orderService->updateStatus(
            order: $order,
            newStatus: $request->status,
            changedBy: $request->user(),
            note: $request->note
        );

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
            'message' => "Order status updated to [{$request->status}].",
        ]);
    }

    /**
     * PATCH /api/v1/orders/{order}/payment
     */
    public function updatePayment(Request $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        $validated = $request->validate([
            'payment_status'    => ['required', 'string', 'in:unpaid,paid,partially_paid,refunded'],
            'payment_reference' => ['nullable', 'string', 'max:100'],
        ]);

        $order = $this->orderService->updatePayment(
            order: $order,
            paymentStatus: $validated['payment_status'],
            reference: $validated['payment_reference'] ?? null
        );

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
            'message' => 'Payment status updated.',
        ]);
    }

    /**
     * POST /api/v1/orders/{order}/cancel
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $order = $this->orderService->cancel($order, $request->user(), $validated['reason']);

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
            'message' => 'Order cancelled.',
        ]);
    }

    /**
     * GET /api/v1/orders/{order}/history
     */
    public function history(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load('statusHistory.changedBy');

        return response()->json([
            'success' => true,
            'data'    => $order->statusHistory,
        ]);
    }

    /**
     * DELETE /api/v1/orders/{order}
     * Soft delete — admin only.
     */
    public function destroy(Order $order): JsonResponse
    {
        $this->authorize('delete', $order);

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted.',
        ]);
    }
}
