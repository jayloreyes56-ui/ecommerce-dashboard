<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Order::class);
    }

    public function rules(): array
    {
        return [
            'customer_id'              => ['required', 'integer', 'exists:customers,id'],
            'assigned_to'              => ['nullable', 'integer', 'exists:users,id'],
            'payment_method'           => ['nullable', 'string', 'max:50'],
            'discount'                 => ['nullable', 'numeric', 'min:0'],
            'tax'                      => ['nullable', 'numeric', 'min:0'],
            'shipping_cost'            => ['nullable', 'numeric', 'min:0'],
            'shipping_address'         => ['nullable', 'array'],
            'shipping_address.street'  => ['nullable', 'string'],
            'shipping_address.city'    => ['nullable', 'string'],
            'shipping_address.country' => ['nullable', 'string'],
            'billing_address'          => ['nullable', 'array'],
            'notes'                    => ['nullable', 'string', 'max:1000'],
            'items'                    => ['required', 'array', 'min:1'],
            'items.*.product_id'       => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'         => ['required', 'integer', 'min:1'],
        ];
    }
}
