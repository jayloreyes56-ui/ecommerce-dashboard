<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'subject'         => $this->subject,
            'status'          => $this->status,
            'channel'         => $this->channel,
            'customer'        => new CustomerResource($this->whenLoaded('customer')),
            'assigned_to'     => new UserResource($this->whenLoaded('assignedTo')),
            'messages'        => MessageResource::collection($this->whenLoaded('messages')),
            'latest_message'  => new MessageResource($this->whenLoaded('latestMessage')),
            'last_message_at' => $this->last_message_at?->toIso8601String(),
            'created_at'      => $this->created_at->toIso8601String(),
        ];
    }
}
