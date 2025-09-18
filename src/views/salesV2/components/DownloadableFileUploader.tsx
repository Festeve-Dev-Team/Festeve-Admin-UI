import { useState } from 'react'
import Upload from '@/components/ui/Upload'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Switcher from '@/components/ui/Switcher'
import { FormItem } from '@/components/ui/Form'
import { uploadSingleFile } from '../services/uploadService'

type Props = {
    isDownloadable: boolean
    downloadUrl?: string
    onIsDownloadableChange: (isDownloadable: boolean) => void
    onDownloadUrlChange: (downloadUrl: string) => void
}

export default function DownloadableFileUploader({ 
    isDownloadable, 
    downloadUrl, 
    onIsDownloadableChange, 
    onDownloadUrlChange 
}: Props) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    async function handleFileUpload(files: File[]) {
        if (files.length === 0) return

        const file = files[0] // Only take the first file
        setIsUploading(true)
        setUploadError(null)

        try {
            console.log('📁 Uploading downloadable file:', file.name)
            const response = await uploadSingleFile(file, 'downloads')
            
            onDownloadUrlChange(response.publicUrl)
            console.log('✅ Downloadable file uploaded successfully:', response.publicUrl)
        } catch (error) {
            console.error('❌ File upload failed:', error)
            setUploadError(error instanceof Error ? error.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    function removeDownloadableFile() {
        onDownloadUrlChange('')
    }

    return (
        <Card>
            <div className="space-y-4">
                <FormItem label="Downloadable Product">
                    <Switcher 
                        checked={isDownloadable} 
                        onChange={(checked, e) => {
                            console.log('🔄 Downloadable switch clicked - new value:', checked)
                            onIsDownloadableChange(checked)
                        }} 
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Enable this if the product is a digital download (PDF, software, etc.)
                    </p>
                </FormItem>

                {isDownloadable && (
                    <>
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold">Download File</h4>
                                    <p className="text-sm text-gray-500">Upload the file customers will download after purchase</p>
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

                            {!downloadUrl ? (
                                <Upload
                                    draggable
                                    accept=".pdf,.zip,.rar,.doc,.docx,.txt,.epub,.mobi"
                                    disabled={isUploading}
                                    beforeUpload={(list) => {
                                        if (!list) return true
                                        const file = Array.from(list)[0]
                                        if (file.size > 50 * 1024 * 1024) return 'File must be under 50MB'
                                        return true
                                    }}
                                    onChange={(files) => handleFileUpload(files)}
                                >
                                    <div className="border border-dashed rounded-md p-6 text-center text-sm text-gray-500">
                                        {isUploading ? 'Uploading...' : 'Drag and drop download file here or click to upload'}
                                        <div className="text-xs text-gray-400 mt-2">
                                            Supported: PDF, ZIP, RAR, DOC, TXT, EPUB, MOBI (Max 50MB)
                                        </div>
                                    </div>
                                </Upload>
                            ) : (
                                <div className="border rounded-md p-4 bg-green-50 dark:bg-green-900/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-green-800 dark:text-green-200">
                                                ✅ Download file uploaded
                                            </div>
                                            <div className="text-sm text-green-600 dark:text-green-400 truncate max-w-md">
                                                {downloadUrl}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="plain"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={removeDownloadableFile}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Card>
    )
}
