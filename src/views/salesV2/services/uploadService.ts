import ApiService from '@/services/ApiService'

export interface UploadResult {
    key: string
    bucket: string
    contentType: string
    size: number
    etag: string
    presignedUrl: string
    publicUrl: string
}

export interface MultipleUploadResponse {
    results: UploadResult[]
    totalFiles: number
    successCount: number
    errorCount: number
    errors: string[]
}

export interface SingleUploadResponse extends UploadResult {}

/**
 * Upload multiple files (for product images)
 */
export async function uploadMultipleFiles(files: File[], folder: string = 'gallery'): Promise<MultipleUploadResponse> {
    try {
        const formData = new FormData()
        formData.append('folder', folder)
        
        files.forEach(file => {
            formData.append('files', file)
        })

        console.log('🌐 Uploading multiple files:', files.length, 'files to folder:', folder)

        const response = await ApiService.fetchData({
            url: '/uploads/multiple',
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        console.log('🌐 Multiple upload response:', response)
        return response.data as MultipleUploadResponse
    } catch (error) {
        console.error('Failed to upload multiple files:', error)
        throw new Error('Failed to upload files')
    }
}

/**
 * Upload single file (for downloadable products)
 */
export async function uploadSingleFile(file: File, folder: string = 'avatars/2025-08'): Promise<SingleUploadResponse> {
    try {
        const formData = new FormData()
        formData.append('folder', folder)
        formData.append('file', file)

        console.log('🌐 Uploading single file:', file.name, 'to folder:', folder)

        const response = await ApiService.fetchData({
            url: '/uploads/upload',
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        console.log('🌐 Single upload response:', response)
        return response.data as SingleUploadResponse
    } catch (error) {
        console.error('Failed to upload single file:', error)
        throw new Error('Failed to upload file')
    }
}
