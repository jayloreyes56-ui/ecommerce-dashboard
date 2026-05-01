<?php

namespace App\Http\Requests\Message;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body'          => ['required', 'string', 'max:5000'],
            'is_internal'   => ['boolean'],
            'attachments'   => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'], // 10MB per file
        ];
    }
}
