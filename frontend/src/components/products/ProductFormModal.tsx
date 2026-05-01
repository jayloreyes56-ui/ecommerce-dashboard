import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Category, Product } from '@/types'

const schema = z.object({
  sku:           z.string().min(1, 'SKU is required').max(100),
  name:          z.string().min(1, 'Name is required').max(255),
  description:   z.string().optional(),
  price:         z.coerce.number().min(0, 'Price must be positive'),
  cost_price:    z.coerce.number().min(0).optional(),
  compare_price: z.coerce.number().min(0).optional(),
  category_id:   z.coerce.number().optional(),
  is_active:     z.boolean().default(true),
  is_featured:   z.boolean().default(false),
  initial_stock: z.coerce.number().min(0).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  product: Product | null
  categories: Category[]
}

export function ProductFormModal({ open, onClose, product, categories }: Props) {
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, is_featured: false },
  })

  useEffect(() => {
    if (product) {
      reset({
        sku:           product.sku,
        name:          product.name,
        description:   product.description ?? '',
        price:         product.price,
        cost_price:    product.cost_price,
        compare_price: product.compare_price ?? undefined,
        category_id:   product.category?.id,
        is_active:     product.is_active,
        is_featured:   product.is_featured,
      })
    } else {
      reset({ is_active: true, is_featured: false })
    }
  }, [product, reset])

  // Wrap setError so it accepts plain string field names (hooks use string, not keyof FormData)
  const handleSetError = (field: string, error: { message: string }) => {
    setError(field as keyof FormData, error)
  }

  // Use the dedicated hooks — they handle cache invalidation and toasts
  const createMutation = useCreateProduct({ onSuccess: onClose, setError: handleSetError })
  const updateMutation = useUpdateProduct({ onSuccess: onClose, setError: handleSetError })

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updateMutation.mutate({ id: product!.id, payload: data })
    } else {
      createMutation.mutate(data)
    }
  }

  const categoryOptions = [
    { value: '', label: 'No category' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            form="product-form"
            type="submit"
            loading={isPending}
          >
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Product Name"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="SKU"
            required
            placeholder="e.g. PHN-001"
            error={errors.sku?.message}
            {...register('sku')}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="Product description…"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Price"
            type="number"
            step="0.01"
            required
            leftIcon={<span className="text-xs">$</span>}
            error={errors.price?.message}
            {...register('price')}
          />
          <Input
            label="Cost Price"
            type="number"
            step="0.01"
            leftIcon={<span className="text-xs">$</span>}
            hint="Internal only"
            {...register('cost_price')}
          />
          <Input
            label="Compare Price"
            type="number"
            step="0.01"
            leftIcon={<span className="text-xs">$</span>}
            hint="Shown as strikethrough"
            {...register('compare_price')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            {...register('category_id')}
          />
          {!isEdit && (
            <Input
              label="Initial Stock"
              type="number"
              min="0"
              placeholder="0"
              hint="Starting inventory quantity"
              {...register('initial_stock')}
            />
          )}
        </div>

        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              {...register('is_active')}
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              {...register('is_featured')}
            />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
        </div>
      </form>
    </Modal>
  )
}
