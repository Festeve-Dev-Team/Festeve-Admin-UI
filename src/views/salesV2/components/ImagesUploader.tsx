import Upload from '@/components/ui/Upload'
import Card from '@/components/ui/Card'
import type { ChangeEvent } from 'react'

type Props = {
    value: string[]
    onChange: (images: string[]) => void
}

export default function ImagesUploader({ value, onChange }: Props) {
    function handleChange(files: File[]) {
        const urls = files.map((f) => URL.createObjectURL(f))
        onChange(urls)
    }

    return (
        <Card>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold">Images</h4>
                    <p className="text-sm text-gray-500">JPEG/PNG/WebP up to 5MB. Drag to upload.</p>
                </div>
            </div>
            <div className="mt-3">
                <Upload
                    draggable
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    beforeUpload={(list) => {
                        if (!list) return true
                        for (const f of Array.from(list)) {
                            if (f.size > 5 * 1024 * 1024) return 'Each image must be under 5MB'
                        }
                        return true
                    }}
                    onChange={(files) => handleChange(files)}
                >
                    <div className="border border-dashed rounded-md p-6 text-center text-sm text-gray-500">Drag and drop images here or click to upload</div>
                </Upload>
            </div>
            {value.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {value.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={src + i} src={src} alt="" className="w-full h-24 object-cover rounded" />
                    ))}
                </div>
            )}
        </Card>
    )
}


