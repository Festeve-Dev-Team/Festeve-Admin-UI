import ChipsInput from './ChipsInput'

type Props = { value: string[]; onChange: (v: string[]) => void }

export default function TrendingEditor({ value, onChange }: Props) {
    return (
        <div>
            <div className="text-sm font-medium mb-1">manuallyCuratedTrending ({value.length})</div>
            <ChipsInput value={value} onChange={onChange} placeholder="Add product IDs (max 100)" />
        </div>
    )
}



