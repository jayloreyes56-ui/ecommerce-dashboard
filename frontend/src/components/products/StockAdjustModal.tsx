import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdjustStock } from '@/hooks/useProducts'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Product } from '@/types'

const schema = z.object({
  change: z.coerce.number().refine((v) => v !== 0, 'Change cannot be zero'),
  reason: z.enum(['restock', 'adjustment', 'damage', 'return', 'other']),
  note:   z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  product: Product
}

export function StockAdjustModal({ open, onClose, product }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reason: 'restock' },
  })

  const adjustMutation = useAdjustStock({
    onSuccess: () => { reset(); onClose() },
  })

  const currentStock = product.inventory?.available ?? 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adjust Stock"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button form="stock-form" type="submit" loading={adjustMutation.isPending}>
            Apply Adjustment
          </Button>
        </>
      }
    >
      <div className="mb-5 rounded-lg bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-700">{product.name}</p>
        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">Current stock:</span>
          <span className="text-sm font-bold text-gray-900">{currentStock} units</span>
        </div>
      </div>

      <form id="stock-form" onSubmit={handleSubmit((d) => adjustMutation.mutate({ id: product.id, payload: d }))} className="space-y-4">
        <Input
          label="Quantity Change"
          type="number"
          required
          hint="Use positive to add stock, negative to remove"
          placeholder="e.g. +50 or -10"
          error={errors.change?.message}
          {...register('change')}
        />

        <Select
          label="Reason"
          required
          options={[
            { value: 'restock',    label: 'Restock' },
            { value: 'adjustment', label: 'Manual Adjustment' },
            { value: 'damage',     label: 'Damage / Loss' },
            { value: 'return',     label: 'Customer Return' },
            { value: 'other',      label: 'Other' },
          ]}
          error={errors.reason?.message}
          {...register('reason')}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Note (optional)</label>
          <textarea
            rows={2}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="Add a note about this adjustment…"
            {...register('note')}
          />
        </div>
      </form>
    </Modal>
  )
}
