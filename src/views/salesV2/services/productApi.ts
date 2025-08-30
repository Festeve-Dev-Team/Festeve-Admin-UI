import ApiService from '@/services/ApiService'
import type { ProductWithId, Product, ProductId, ProductsApiResponse } from '../types/product'

export async function getProduct(id: ProductId): Promise<ProductWithId | null> {
    try {
        const response = await ApiService.fetchData<Product>({
            url: `/products/${id}`,
            method: 'get',
        })
        
        if (response.data) {
            // Convert _id to id for consistency with existing component
            return {
                ...response.data,
                id: response.data._id
            }
        }
        return null
    } catch (error) {
        console.error('Error fetching product:', error)
        return null
    }
}

export async function listProducts(page: number = 1, limit: number = 20): Promise<{
    products: ProductWithId[]
    pagination: ProductsApiResponse['pagination']
}> {
    try {
        const response = await ApiService.fetchData<ProductsApiResponse>({
            url: `/products`,
            method: 'get',
        })
        
        if (response.data) {
            // Convert _id to id for consistency with existing component
            const products = response.data.products.map(product => ({
                ...product,
                id: product._id
            }))
            
            return {
                products,
                pagination: response.data.pagination
            }
        }
        
        return {
            products: [],
            pagination: {
                page: 1,
                limit: 20,
                total: 0,
                pages: 0
            }
        }
    } catch (error) {
        console.error('Error fetching products:', error)
        return {
            products: [],
            pagination: {
                page: 1,
                limit: 20,
                total: 0,
                pages: 0
            }
        }
    }
}

export async function saveProduct(
    dto: ProductWithId | Product,
): Promise<ProductWithId> {
    try {
        const isUpdate = 'id' in dto && dto.id
        const url = isUpdate ? `/products/${dto.id}` : '/products'
        const method = isUpdate ? 'put' : 'post'
        
        // Convert id back to _id for API
        const apiData = { ...dto }
        if ('id' in apiData) {
            delete apiData.id
        }
        if (isUpdate && '_id' in dto) {
            apiData._id = (dto as any).id || (dto as any)._id
        }
        
        const response = await ApiService.fetchData<Product>({
            url,
            method,
            data: apiData,
        })
        
        if (response.data) {
            return {
                ...response.data,
                id: response.data._id
            }
        }
        
        throw new Error('Failed to save product')
    } catch (error) {
        console.error('Error saving product:', error)
        throw error
    }
}


