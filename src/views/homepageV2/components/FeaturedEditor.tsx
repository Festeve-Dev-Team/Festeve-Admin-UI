import ChipsInput from './ChipsInput'

type Props = {
    products: string[]
    events: string[]
    onChangeProducts: (v: string[]) => void
    onChangeEvents: (v: string[]) => void
}

export default function FeaturedEditor({ products, events, onChangeProducts, onChangeEvents }: Props) {
    return (
        <div className="space-y-4">
            <div>
                <div className="text-sm font-medium mb-1">featuredProductIds ({products.length})</div>
                <ChipsInput value={products} onChange={onChangeProducts} placeholder="Add product IDs" />
            </div>
            <div>
                <div className="text-sm font-medium mb-1">featuredEventIds ({events.length})</div>
                <ChipsInput value={events} onChange={onChangeEvents} placeholder="Add event IDs" />
            </div>
        </div>
    )
}



