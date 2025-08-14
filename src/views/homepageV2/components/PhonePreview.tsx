import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import type { HomepageFormInput } from '../schema/homepageSchema'

type Props = { form: HomepageFormInput }

export default function PhonePreview({ form }: Props) {
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <h4 className="font-semibold">Preview</h4>
                <div className="text-xs text-gray-500">Mobile mock</div>
                <div className="mt-3 space-y-2">
                    {form.homepageSections
                        .filter((s) => s.enabled)
                        .map((s, i) => (
                            <div key={i} className="p-2 border rounded-md">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{s.title || s.key}</div>
                                    <Tag className="bg-gray-100 border px-2 py-0.5 rounded">{s.key}</Tag>
                                </div>
                                <div className="text-xs text-gray-500">{s.description}</div>
                            </div>
                        ))}
                </div>
            </Card>
        </div>
    )
}



