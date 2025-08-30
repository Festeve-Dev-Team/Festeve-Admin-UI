import { z } from 'zod'

export const categorySchema = z.object({
    id: z.string().optional(), // For editing existing categories
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    isActive: z.boolean().default(true),
    parentId: z.string().nullable().optional(),
    displayOrder: z.number().int().min(1, 'Display order must be at least 1').default(1),
    attributes: z.array(z.string()).default([]),
})

export type CategoryFormInput = z.infer<typeof categorySchema>

export const defaultCategoryValues: CategoryFormInput = {
    name: '',
    isActive: true,
    parentId: null,
    displayOrder: 1,
    attributes: [],
}
