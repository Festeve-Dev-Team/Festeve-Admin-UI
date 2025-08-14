import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PurohitFormV2 from './PurohitFormV2'
import { getPurohit } from './services/purohitApi'
import type { PurohitFormInput } from './schema/purohitSchema'

export default function PurohitEditV2() {
    const { purohitId } = useParams()
    const navigate = useNavigate()
    const [initial, setInitial] = useState<PurohitFormInput | null>(null)

    useEffect(() => {
        if (!purohitId) return
        getPurohit(purohitId).then((p) => p && setInitial(p))
    }, [purohitId])

    if (!initial) return null

    return (
        <PurohitFormV2 initial={initial} headerTitle={initial.name} onSaved={() => navigate('/app/purohits-v2/purohit-list')} />
    )
}


