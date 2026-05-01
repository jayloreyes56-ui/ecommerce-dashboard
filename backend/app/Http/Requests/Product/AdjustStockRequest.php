<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage-inventory');
    }

    public function rules(): array
    {
        return [
            'change' => ['required', 'integer', 'not_in:0'],
            'reason' => ['required', 'string', Rule::in(['restock', 'adjustment', 'damage', 'return', 'other'])],
            'note'   => ['nullable', 'string', 'max:500'],
        ];
    }
}
