export type HomepageSection = {
    key: string
    enabled: boolean
    title?: string
    description?: string
    imageUrl?: string
    productId?: string
    eventId?: string
}

export type Banner = {
    title?: string
    description?: string
    imageUrl: string
    linkUrl?: string
    productId?: string
    eventId?: string
    position: number
    isActive: boolean
}

export type HomepageConfig = {
    dailyEventId?: string
    homepageSections: HomepageSection[]
    banners: Banner[]
    featuredProductIds: string[]
    featuredEventIds: string[]
    manuallyCuratedTrending: string[]
    customSections: Record<string, unknown>
}

export type HomepageId = string
export type HomepageWithId = HomepageConfig & { id: HomepageId }



