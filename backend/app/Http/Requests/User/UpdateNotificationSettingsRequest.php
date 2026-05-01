<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email_orders'    => ['sometimes', 'boolean'],
            'email_messages'  => ['sometimes', 'boolean'],
            'email_reports'   => ['sometimes', 'boolean'],
            'push_orders'     => ['sometimes', 'boolean'],
            'push_messages'   => ['sometimes', 'boolean'],
            'push_low_stock'  => ['sometimes', 'boolean'],
        ];
    }
}
