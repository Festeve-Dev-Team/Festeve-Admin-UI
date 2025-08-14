export type CommissionType = 'percentage' | 'fixed'

export type Availability = {
    date: string
    timeSlots: string[]
}

export type Location = {
    city: string
    state: string
    pincode: string
}

export type Purohit = {
    name: string
    phone: string
    location: Location
    experienceYears: number
    skills: string[]
    availability: Availability[]
    bio: string
    customSkills: Record<string, string | number>
    rituals: string[]
    languages: string[]
    chargesCommission: boolean
    commissionType: CommissionType
    commissionValue: number
    isActive: boolean
}

export type PurohitId = string
export type PurohitWithId = Purohit & { id: PurohitId }


