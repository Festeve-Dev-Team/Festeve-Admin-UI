import HomepageFormV2 from './HomepageFormV2'
import { defaultHomepageValues } from './schema/homepageSchema'

export default function HomepageConfigureV2() {
    return <HomepageFormV2 initial={defaultHomepageValues} headerTitle="Homepage Configure" />
}



