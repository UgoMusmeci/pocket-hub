export type CatalogSet = {
  id: string
  name: string
  releaseDate: string
  officialCardCount: number
  totalCardCount: number
  source: string
  sourceUrl?: string
  symbol?: string
  logo?: string
}

export type CatalogCard = {
  id: string
  localId: string
  name: string
  category: string
  rarity?: string
  hp?: number
  stage?: string
  suffix?: string
  types: string[]
  setId: string
  setName: string
  source: string
  image: string
  localImage?: string
  attacks: Array<{
    name: string
    damage?: string
    effect?: string
    cost?: string[]
  }>
  weaknesses: Array<{
    type: string
    value?: string
  }>
  retreat?: number
  illustrator?: string
  updated?: string
}

export type CatalogData = {
  metadata: {
    generatedAt: string
    source: string
    seriesId: string
    seriesName: string
    setCount: number
    cardCount: number
  }
  sets: CatalogSet[]
  cards: CatalogCard[]
}
