import PurohitFormV2 from './PurohitFormV2'
import { defaultPurohitValues } from './schema/purohitSchema'
import { useNavigate } from 'react-router-dom'

export default function PurohitCreateV2() {
    const navigate = useNavigate()
    return (
        <PurohitFormV2
            initial={defaultPurohitValues}
            headerTitle="New Purohit"
            onSaved={() => navigate('/app/purohits-v2/purohit-list')}
        />
    )
}


