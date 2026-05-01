<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('product'));
    }

    public function rules(): array
    {
        $productId = $this->route('product')->id;

        return [
            'category_id'   => ['nullable', 'integer', 'exists:categories,id'],
            'sku'           => ['sometimes', 'string', 'max:100', "unique:products,sku,{$productId}"],
            'name'          => ['sometimes', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'price'         => ['sometimes', 'numeric', 'min:0'],
            'cost_price'    => ['nullable', 'numeric', 'min:0'],
            'compare_price' => ['nullable', 'numeric', 'min:0'],
            'attributes'    => ['nullable', 'array'],
            'is_active'     => ['boolean'],
            'is_featured'   => ['boolean'],
        ];
    }
}
