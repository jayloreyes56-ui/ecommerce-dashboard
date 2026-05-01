<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'body'            => $this->body,
            'attachments'     => $this->attachments ?? [],
            'is_internal'     => $this->is_internal,
            'is_from_staff'   => $this->isFromStaff(),
            'sender_type'     => $this->sender_type === User::class ? 'staff' : 'customer',
            'sender'          => $this->whenLoaded('sender', function () {
                return [
                    'id'   => $this->sender?->id,
                    'name' => $this->sender?->name,
                ];
            }),
            'read_at'         => $this->read_at?->toIso8601String(),
            'created_at'      => $this->created_at->toIso8601String(),
        ];
    }
}
