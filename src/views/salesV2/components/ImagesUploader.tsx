import { useState } from 'react'
import Upload from '@/components/ui/Upload'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { uploadMultipleFiles } from '../services/uploadService'
import type { ChangeEvent } from 'react'

type Props = {
    value: string[]
    onChange: (images: string[]) => void
}

export default function ImagesUploader({ value, onChange }: Props) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    async function handleChange(files: File[]) {
        if (files.length === 0) return

        setIsUploading(true)
        setUploadError(null)

        try {
            console.log('🖼️ Uploading', files.length, 'images...')
            const response = await uploadMultipleFiles(files, 'gallery')
            
            if (response.successCount > 0) {
                const newUrls = response.results.map(result => result.publicUrl)
                const updatedImages = [...value, ...newUrls]
                onChange(updatedImages)
                console.log('✅ Images uploaded successfully:', newUrls)
            }

            if (response.errorCount > 0) {
                console.warn('⚠️ Some uploads failed:', response.errors)
                setUploadError(`${response.errorCount} files failed to upload`)
            }
        } catch (error) {
            console.error('❌ Upload failed:', error)
            setUploadError(error instanceof Error ? error.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    function removeImage(index: number) {
        const newImages = value.filter((_, i) => i !== index)
        onChange(newImages)
    }

    return (
        <Card>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold">Images</h4>
                    <p className="text-sm text-gray-500">JPEG/PNG/WebP up to 5MB. Drag to upload.</p>
                    {uploadError && (
                        <p className="text-sm text-red-500 mt-1">{uploadError}</p>
                    )}
                </div>
                {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Spinner size="sm" />
                        Uploading...
                    </div>
                )}
            </div>
            <div className="mt-3">
                <Upload
                    draggable
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={isUploading}
                    beforeUpload={(list) => {
                        if (!list) return true
                        for (const f of Array.from(list)) {
                            if (f.size > 5 * 1024 * 1024) return 'Each image must be under 5MB'
                        }
                        return true
                    }}
                    onChange={(files) => handleChange(files)}
                >
                    <div className="border border-dashed rounded-md p-6 text-center text-sm text-gray-500">
                        {isUploading ? 'Uploading...' : 'Drag and drop images here or click to upload'}
                    </div>
                </Upload>
            </div>
            {value.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {value.map((src, i) => (
                        <div key={src + i} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="w-full h-24 object-cover rounded" />
                            <Button
                                size="xs"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => removeImage(i)}
                            >
                                ×
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}


