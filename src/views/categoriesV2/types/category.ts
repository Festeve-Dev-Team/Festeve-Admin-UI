export type CategoryPath = {
    id: string
    slug: string
    name: string
}

export type CategoryDto = {
    name?: string
    slug?: string // Auto-generated if not provided
    parentId?: string | null
    isActive?: boolean
    displayOrder?: number
    image?: string // Category image URL
    attributes?: string[]
}

export type CategoryWithId = CategoryDto & {
    _id: string
    id: string
    isLeaf: boolean
    path: CategoryPath[]
    slug: string
    level: number
    fullSlug: string
    code: string
    createdAt: string
    updatedAt: string
    __v: number
}

export type CategoriesApiResponse = {
    categories: CategoryWithId[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export type CategoryTreeNode = CategoryWithId & {
    children?: CategoryTreeNode[]
}
