export type CategoryPath = {
    id: string
    slug: string
    name: string
}

export type CategoryDto = {
    name: string
    isActive: boolean
    parentId: string | null
    displayOrder: number
    attributes: string[]
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
