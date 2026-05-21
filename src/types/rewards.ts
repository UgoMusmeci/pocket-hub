export type RewardType =
  | 'emblema'
  | 'moneta'
  | 'copertina_carte'
  | 'custodia_raccoglitore'
  | 'tabellone'
  | 'icona'

export type RewardMethod =
  | 'themed_collection'
  | 'missione'
  | 'missione_segreta'
  | 'evento'
  | 'shop'
  | 'bundle'
  | 'premium'
  | 'iniziale'
  | 'bonus_accesso'
  | 'archivio_gioco'
  | 'da_verificare'

export type RewardAvailability =
  | 'ottenibile'
  | 'evento_scaduto'
  | 'shop_bundle'
  | 'storico'
  | 'catalogata'
  | 'da_verificare'

export type RewardGuide = {
  slug: string
  name: string
  type: RewardType
  imageUrl: string
  sourceImageUrl: string
  method: RewardMethod
  availability: RewardAvailability
  sourceContext: string
  requirement: string
  description: string
  notes?: string
  sourceLabel: string
  sourceUrl: string
  startDate?: string
  endDate?: string
}
