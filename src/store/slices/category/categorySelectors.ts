import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../rootReducer'
import type { CategoryWithId, CategoryTreeNode } from '@/views/categoriesV2/types/category'

// Base selectors
export const selectCategoryState = (state: RootState) => state.category

export const selectCategories = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.categories || []
)

export const selectSelectedCategory = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.selectedCategory
)

export const selectParentCategories = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.parentCategories || []
)

export const selectCategoryPagination = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.pagination
)

export const selectCategoryFilters = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.filters
)

// Loading selectors
export const selectCategoriesLoading = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.loading.list
)

export const selectCategoryLoading = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.loading.fetch
)

export const selectParentCategoriesLoading = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.loading.parents
)

export const selectCategoryCreateLoading = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.loading.create
)

export const selectCategoryUpdateLoading = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.loading.update
)

export const selectCategoryDeleteLoading = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.loading.delete
)

export const selectCategoryAnyLoading = createSelector(
    [selectCategoryState],
    (categoryState) => Object.values(categoryState.loading).some(Boolean)
)

// Error selectors
export const selectCategoriesError = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.error.list
)

export const selectCategoryError = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.error.fetch
)

export const selectParentCategoriesError = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.error.parents
)

export const selectCategoryCreateError = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.error.create
)

export const selectCategoryUpdateError = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.error.update
)

export const selectCategoryDeleteError = createSelector(
    [selectCategoryState],
    (categoryState) => categoryState.error.delete
)

export const selectCategoryAnyError = createSelector(
    [selectCategoryState],
    (categoryState) => Object.values(categoryState.error).find(error => error !== null) || null
)

// Filtered categories
export const selectFilteredCategories = createSelector(
    [selectCategories, selectCategoryFilters],
    (categories, filters) => {
        // Safety check for categories array
        if (!categories || !Array.isArray(categories)) {
            return []
        }

        let filtered = [...categories]

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(category => 
                category.name?.toLowerCase().includes(searchLower) ||
                category.slug?.toLowerCase().includes(searchLower) ||
                category.fullSlug?.toLowerCase().includes(searchLower)
            )
        }

        // Level filter
        if (filters.level !== null) {
            filtered = filtered.filter(category => category.level === filters.level)
        }

        // Parent filter
        if (filters.parentId) {
            filtered = filtered.filter(category => category.parentId === filters.parentId)
        }

        // Sort
        filtered.sort((a, b) => {
            const aValue = a[filters.sortBy as keyof CategoryWithId] as string | number
            const bValue = b[filters.sortBy as keyof CategoryWithId] as string | number
            
            if (filters.sortOrder === 'desc') {
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return bValue.localeCompare(aValue)
                }
                return (bValue as number) - (aValue as number)
            }
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return aValue.localeCompare(bValue)
            }
            return (aValue as number) - (bValue as number)
        })

        return filtered
    }
)

// Hierarchical tree structure
export const selectCategoryTree = createSelector(
    [selectCategories],
    (categories): CategoryTreeNode[] => {
        if (!categories || !Array.isArray(categories)) {
            return []
        }

        const categoryMap = new Map<string, CategoryTreeNode>()
        const rootCategories: CategoryTreeNode[] = []

        // Create a map of all categories
        categories.forEach(category => {
            categoryMap.set(category.id, { ...category, children: [] })
        })

        // Build the tree structure
        categories.forEach(category => {
            const categoryNode = categoryMap.get(category.id)!
            
            if (category.parentId && categoryMap.has(category.parentId)) {
                // Add to parent's children
                const parent = categoryMap.get(category.parentId)!
                if (!parent.children) parent.children = []
                parent.children.push(categoryNode)
            } else {
                // Root level category
                rootCategories.push(categoryNode)
            }
        })

        // Sort children at each level by displayOrder
        const sortChildren = (nodes: CategoryTreeNode[]) => {
            nodes.sort((a, b) => a.displayOrder - b.displayOrder)
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    sortChildren(node.children)
                }
            })
        }

        sortChildren(rootCategories)
        return rootCategories
    }
)

// Statistics
export const selectCategoryStats = createSelector(
    [selectCategories],
    (categories) => {
        // Safety check for categories array
        if (!categories || !Array.isArray(categories)) {
            return {
                totalCategories: 0,
                activeCategories: 0,
                level1Categories: 0,
                level2Categories: 0,
                level3Categories: 0,
                categoriesWithAttributes: 0
            }
        }

        const totalCategories = categories.length
        const activeCategories = categories.filter(c => c.isActive).length
        const level1Categories = categories.filter(c => c.level === 1).length
        const level2Categories = categories.filter(c => c.level === 2).length
        const level3Categories = categories.filter(c => c.level === 3).length
        const categoriesWithAttributes = categories.filter(c => c.attributes && c.attributes.length > 0).length

        return {
            totalCategories,
            activeCategories,
            level1Categories,
            level2Categories,
            level3Categories,
            categoriesWithAttributes
        }
    }
)

// Cache selectors
export const selectCategoryCacheStatus = createSelector(
    [selectCategoryState],
    (categoryState) => ({
        lastFetched: categoryState.lastFetched,
        isStale: categoryState.lastFetched 
            ? Date.now() - categoryState.lastFetched > categoryState.cacheExpiry 
            : true
    })
)
