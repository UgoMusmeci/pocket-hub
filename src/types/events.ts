export type EventType =
  | 'emblem_event'
  | 'wonder_pick'
  | 'drop_event'
  | 'mass_outbreak'
  | 'special_missions'
  | 'special_event'

export type EventGuide = {
  slug: string
  name: string
  type: EventType
  startDate: string
  endDate: string
  summary: string
  description: string
  consumableRewards: string[]
  rewardSlugs: string[]
  promoCardIds: string[]
  imageUrl: string
  imageAlt: string
  linkedSetId?: string
  linkedSetName?: string
  notes?: string
  sourceLabel: string
  sourceUrl: string
}
