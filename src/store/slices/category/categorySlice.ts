import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory, getCategoriesForParentSelection } from '@/views/categoriesV2/services/categoryApi'
import type { CategoryWithId, CategoryDto } from '@/views/categoriesV2/types/category'
import type { 
    CategoryState, 
    CategoryListParams, 
    CategoryUpdatePayload, 
    CategoryDeletePayload,
    CategoryApiError 
} from './types'

const SLICE_NAME = 'category'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Initial state
const initialState: CategoryState = {
    categories: [],
    selectedCategory: null,
    parentCategories: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    },
    loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        fetch: false,
        parents: false
    },
    error: {
        list: null,
        create: null,
        update: null,
        delete: null,
        fetch: null,
        parents: null
    },
    filters: {
        search: '',
        level: null,
        parentId: null,
        sortBy: 'displayOrder',
        sortOrder: 'asc'
    },
    lastFetched: null,
    cacheExpiry: CACHE_DURATION
}

// Async Thunks
export const fetchCategories = createAsyncThunk<
    { categories: CategoryWithId[]; pagination: CategoryState['pagination'] },
    CategoryListParams,
    { rejectValue: CategoryApiError }
>(
    `${SLICE_NAME}/fetchCategories`,
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 20, ...filters } = params
            const response = await getCategories({ page, limit, ...filters })
            
            return {
                categories: response.categories,
                pagination: response.pagination
            }
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to fetch categories',
                status: error?.response?.status
            })
        }
    }
)

export const fetchCategoryById = createAsyncThunk<
    CategoryWithId,
    string,
    { rejectValue: CategoryApiError }
>(
    `${SLICE_NAME}/fetchCategoryById`,
    async (categoryId, { rejectWithValue }) => {
        try {
            const category = await getCategory(categoryId)
            if (!category) {
                return rejectWithValue({
                    message: 'Category not found',
                    status: 404
                })
            }
            return category
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to fetch category',
                status: error?.response?.status
            })
        }
    }
)

export const fetchParentCategories = createAsyncThunk<
    CategoryWithId[],
    number,
    { rejectValue: CategoryApiError }
>(
    `${SLICE_NAME}/fetchParentCategories`,
    async (currentLevel, { rejectWithValue }) => {
        try {
            const categories = await getCategoriesForParentSelection(currentLevel)
            return categories
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to fetch parent categories',
                status: error?.response?.status
            })
        }
    }
)

export const createNewCategory = createAsyncThunk<
    CategoryWithId,
    CategoryDto,
    { rejectValue: CategoryApiError }
>(
    `${SLICE_NAME}/createCategory`,
    async (categoryData, { rejectWithValue }) => {
        try {
            const newCategory = await createCategory(categoryData)
            return newCategory
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to create category',
                status: error?.response?.status,
                field: error?.response?.data?.field
            })
        }
    }
)

export const updateExistingCategory = createAsyncThunk<
    CategoryWithId,
    CategoryUpdatePayload,
    { rejectValue: CategoryApiError }
>(
    `${SLICE_NAME}/updateCategory`,
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const updatedCategory = await updateCategory(id, data)
            return updatedCategory
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to update category',
                status: error?.response?.status,
                field: error?.response?.data?.field
            })
        }
    }
)

export const removeCategory = createAsyncThunk<
    string,
    CategoryDeletePayload,
    { rejectValue: CategoryApiError }
>(
    `${SLICE_NAME}/deleteCategory`,
    async ({ id }, { rejectWithValue }) => {
        try {
            await deleteCategory(id)
            return id
        } catch (error: any) {
            return rejectWithValue({
                message: error?.response?.data?.message || error.message || 'Failed to delete category',
                status: error?.response?.status
            })
        }
    }
)

// Slice
const categorySlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        // UI Actions
        setCategoryFilters: (state, action: PayloadAction<Partial<CategoryState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload }
        },
        clearCategoryFilters: (state) => {
            state.filters = initialState.filters
        },
        setSelectedCategory: (state, action: PayloadAction<CategoryWithId | null>) => {
            state.selectedCategory = action.payload
        },
        clearSelectedCategory: (state) => {
            state.selectedCategory = null
        },
        
        // Error Management
        clearCategoryError: (state, action: PayloadAction<keyof CategoryState['error']>) => {
            state.error[action.payload] = null
        },
        clearAllCategoryErrors: (state) => {
            state.error = initialState.error
        },
        
        // Cache Management
        invalidateCategoryCache: (state) => {
            state.lastFetched = null
        },
        
        // Optimistic Updates
        optimisticUpdateCategory: (state, action: PayloadAction<CategoryWithId>) => {
            const index = state.categories.findIndex(c => c.id === action.payload.id)
            if (index !== -1) {
                state.categories[index] = action.payload
            }
        },
        
        optimisticDeleteCategory: (state, action: PayloadAction<string>) => {
            state.categories = state.categories.filter(c => c.id !== action.payload)
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading.list = true
                state.error.list = null
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading.list = false
                state.categories = action.payload.categories
                state.pagination = action.payload.pagination
                state.lastFetched = Date.now()
                state.error.list = null
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading.list = false
                state.error.list = action.payload?.message || 'Failed to fetch categories'
            })
            
            // Fetch Category by ID
            .addCase(fetchCategoryById.pending, (state) => {
                state.loading.fetch = true
                state.error.fetch = null
            })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.loading.fetch = false
                state.selectedCategory = action.payload
                state.error.fetch = null
                
                // Update in categories list if it exists
                const index = state.categories.findIndex(c => c.id === action.payload.id)
                if (index !== -1) {
                    state.categories[index] = action.payload
                }
            })
            .addCase(fetchCategoryById.rejected, (state, action) => {
                state.loading.fetch = false
                state.error.fetch = action.payload?.message || 'Failed to fetch category'
            })
            
            // Fetch Parent Categories
            .addCase(fetchParentCategories.pending, (state) => {
                state.loading.parents = true
                state.error.parents = null
            })
            .addCase(fetchParentCategories.fulfilled, (state, action) => {
                state.loading.parents = false
                state.parentCategories = action.payload
                state.error.parents = null
            })
            .addCase(fetchParentCategories.rejected, (state, action) => {
                state.loading.parents = false
                state.error.parents = action.payload?.message || 'Failed to fetch parent categories'
            })
            
            // Create Category
            .addCase(createNewCategory.pending, (state) => {
                state.loading.create = true
                state.error.create = null
            })
            .addCase(createNewCategory.fulfilled, (state, action) => {
                state.loading.create = false
                state.categories.unshift(action.payload) // Add to beginning
                state.pagination.total += 1
                state.selectedCategory = action.payload
                state.error.create = null
            })
            .addCase(createNewCategory.rejected, (state, action) => {
                state.loading.create = false
                state.error.create = action.payload?.message || 'Failed to create category'
            })
            
            // Update Category
            .addCase(updateExistingCategory.pending, (state) => {
                state.loading.update = true
                state.error.update = null
            })
            .addCase(updateExistingCategory.fulfilled, (state, action) => {
                state.loading.update = false
                const index = state.categories.findIndex(c => c.id === action.payload.id)
                if (index !== -1) {
                    state.categories[index] = action.payload
                }
                if (state.selectedCategory?.id === action.payload.id) {
                    state.selectedCategory = action.payload
                }
                state.error.update = null
            })
            .addCase(updateExistingCategory.rejected, (state, action) => {
                state.loading.update = false
                state.error.update = action.payload?.message || 'Failed to update category'
            })
            
            // Delete Category
            .addCase(removeCategory.pending, (state) => {
                state.loading.delete = true
                state.error.delete = null
            })
            .addCase(removeCategory.fulfilled, (state, action) => {
                state.loading.delete = false
                state.categories = state.categories.filter(c => c.id !== action.payload)
                state.pagination.total = Math.max(0, state.pagination.total - 1)
                if (state.selectedCategory?.id === action.payload) {
                    state.selectedCategory = null
                }
                state.error.delete = null
            })
            .addCase(removeCategory.rejected, (state, action) => {
                state.loading.delete = false
                state.error.delete = action.payload?.message || 'Failed to delete category'
            })
    }
})

export const {
    setCategoryFilters,
    clearCategoryFilters,
    setSelectedCategory,
    clearSelectedCategory,
    clearCategoryError,
    clearAllCategoryErrors,
    invalidateCategoryCache,
    optimisticUpdateCategory,
    optimisticDeleteCategory
} = categorySlice.actions

export default categorySlice.reducer
