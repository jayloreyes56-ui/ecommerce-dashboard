<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Message;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MessageService
{
    /**
     * List conversations with filters.
     */
    public function listConversations(array $filters): LengthAwarePaginator
    {
        return Conversation::query()
            ->with(['customer', 'assignedTo', 'latestMessage'])
            ->when(isset($filters['status']), fn ($q) => $q->where('status', $filters['status']))
            ->when(isset($filters['assigned_to']), fn ($q) => $q->assignedTo($filters['assigned_to']))
            ->when(isset($filters['customer_id']), fn ($q) => $q->where('customer_id', $filters['customer_id']))
            ->orderBy('last_message_at', 'desc')
            ->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Start a new conversation with a customer.
     */
    public function startConversation(Customer $customer, string $subject, User $assignedTo = null): Conversation
    {
        return Conversation::create([
            'customer_id' => $customer->id,
            'assigned_to' => $assignedTo?->id,
            'subject'     => $subject,
            'status'      => 'open',
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(
        Conversation $conversation,
        string $body,
        User|Customer $sender,
        bool $isInternal = false,
        array $attachments = []
    ): Message {
        return DB::transaction(function () use ($conversation, $body, $sender, $isInternal, $attachments) {
            $message = $conversation->messages()->create([
                'sender_type' => get_class($sender),
                'sender_id'   => $sender->id,
                'body'        => $body,
                'attachments' => $attachments,
                'is_internal' => $isInternal,
            ]);

            $conversation->update(['last_message_at' => now()]);

            return $message->load('sender');
        });
    }

    /**
     * Mark all unread messages in a conversation as read.
     */
    public function markConversationRead(Conversation $conversation, User $reader): int
    {
        return $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_type', '!=', User::class)
            ->update(['read_at' => now()]);
    }

    /**
     * Assign conversation to a staff member.
     */
    public function assign(Conversation $conversation, User $user): Conversation
    {
        $conversation->update(['assigned_to' => $user->id]);

        return $conversation->fresh(['assignedTo']);
    }

    /**
     * Close a conversation.
     */
    public function close(Conversation $conversation): Conversation
    {
        $conversation->update(['status' => 'closed']);

        return $conversation->fresh();
    }

    /**
     * Reopen a closed conversation.
     */
    public function reopen(Conversation $conversation): Conversation
    {
        $conversation->update(['status' => 'open']);

        return $conversation->fresh();
    }
}
