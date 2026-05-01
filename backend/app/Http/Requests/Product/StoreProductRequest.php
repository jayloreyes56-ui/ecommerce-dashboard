<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Product::class);
    }

    public function rules(): array
    {
        return [
            'category_id'     => ['nullable', 'integer', 'exists:categories,id'],
            'sku'             => ['required', 'string', 'max:100', 'unique:products,sku'],
            'name'            => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'price'           => ['required', 'numeric', 'min:0'],
            'cost_price'      => ['nullable', 'numeric', 'min:0'],
            'compare_price'   => ['nullable', 'numeric', 'min:0'],
            'attributes'      => ['nullable', 'array'],
            'is_active'       => ['boolean'],
            'is_featured'     => ['boolean'],
            'initial_stock'   => ['nullable', 'integer', 'min:0'],
        ];
    }
}
