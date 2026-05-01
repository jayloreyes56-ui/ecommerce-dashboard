<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\SendMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Customer;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct(
        private readonly MessageService $messageService
    ) {}

    /**
     * GET /api/v1/conversations
     */
    public function indexConversations(Request $request): JsonResponse
    {
        $conversations = $this->messageService->listConversations($request->only([
            'status', 'assigned_to', 'customer_id', 'per_page',
        ]));

        return response()->json([
            'success' => true,
            'data'    => ConversationResource::collection($conversations),
            'meta'    => [
                'current_page' => $conversations->currentPage(),
                'per_page'     => $conversations->perPage(),
                'total'        => $conversations->total(),
            ],
        ]);
    }

    /**
     * POST /api/v1/conversations
     */
    public function startConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'subject'     => ['nullable', 'string', 'max:255'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $customer = Customer::findOrFail($validated['customer_id']);

        $conversation = $this->messageService->startConversation(
            customer: $customer,
            subject: $validated['subject'] ?? '',
            assignedTo: $validated['assigned_to'] ? \App\Models\User::find($validated['assigned_to']) : null
        );

        return response()->json([
            'success' => true,
            'data'    => new ConversationResource($conversation->load(['customer', 'assignedTo'])),
            'message' => 'Conversation started.',
        ], 201);
    }

    /**
     * GET /api/v1/conversations/{conversation}
     */
    public function showConversation(Conversation $conversation): JsonResponse
    {
        $conversation->load(['customer', 'assignedTo', 'messages.sender']);

        return response()->json([
            'success' => true,
            'data'    => new ConversationResource($conversation),
        ]);
    }

    /**
     * POST /api/v1/conversations/{conversation}/messages
     */
    public function sendMessage(SendMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $message = $this->messageService->sendMessage(
            conversation: $conversation,
            body: $request->body,
            sender: $request->user(),
            isInternal: $request->boolean('is_internal'),
            attachments: [] // handle file uploads separately
        );

        return response()->json([
            'success' => true,
            'data'    => new MessageResource($message),
            'message' => 'Message sent.',
        ], 201);
    }

    /**
     * POST /api/v1/conversations/{conversation}/read
     */
    public function markRead(Request $request, Conversation $conversation): JsonResponse
    {
        $count = $this->messageService->markConversationRead($conversation, $request->user());

        return response()->json([
            'success' => true,
            'message' => "{$count} messages marked as read.",
        ]);
    }

    /**
     * PATCH /api/v1/conversations/{conversation}/assign
     */
    public function assign(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $conversation = $this->messageService->assign(
            $conversation,
            \App\Models\User::findOrFail($validated['user_id'])
        );

        return response()->json([
            'success' => true,
            'data'    => new ConversationResource($conversation),
            'message' => 'Conversation assigned.',
        ]);
    }

    /**
     * PATCH /api/v1/conversations/{conversation}/close
     */
    public function close(Conversation $conversation): JsonResponse
    {
        $conversation = $this->messageService->close($conversation);

        return response()->json([
            'success' => true,
            'data'    => new ConversationResource($conversation),
            'message' => 'Conversation closed.',
        ]);
    }

    /**
     * PATCH /api/v1/conversations/{conversation}/reopen
     */
    public function reopen(Conversation $conversation): JsonResponse
    {
        $conversation = $this->messageService->reopen($conversation);

        return response()->json([
            'success' => true,
            'data'    => new ConversationResource($conversation),
            'message' => 'Conversation reopened.',
        ]);
    }
}
