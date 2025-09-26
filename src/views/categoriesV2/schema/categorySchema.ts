import { z } from 'zod'

export const categorySchema = z.object({
    id: z.string().optional(), // For editing existing categories
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    slug: z.string().optional(), // Auto-generated if not provided
    isActive: z.boolean().default(true),
    parentId: z.string().nullable().optional(),
    displayOrder: z.number().int().min(0, 'Display order must be at least 0').default(0),
    image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
    attributes: z.array(z.string()).default([]),
})

export type CategoryFormInput = z.infer<typeof categorySchema>

export const defaultCategoryValues: CategoryFormInput = {
    name: '',
    slug: '',
    isActive: true,
    parentId: null,
    displayOrder: 0,
    image: '',
    attributes: [],
}
