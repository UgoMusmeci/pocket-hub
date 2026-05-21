export type DeckCardEntry = {
  name: string
  count: number
}

export type DeckIdea = {
  slug: string
  name: string
  tier: string
  playStyle: string
  difficulty: string
  bestFor: string
  description: string
  strategy: string
  strengths: string[]
  weaknesses: string[]
  source: string
  updatedAt: string
  representativeCard: string
  representativePokemon: {
    name: string
    sprite: string
  }
  secondaryPokemon: {
    name: string
    sprite: string
  }
  cards: DeckCardEntry[]
}

export const artwork = (dexId: number) =>
  `/pokemon-artwork/${dexId}.png`

const specialArtwork: Record<string, string> = {
  'mega-charizard-x': artwork(10034),
  'mega-charizard-y': artwork(10035),
  'mega-scizor': artwork(10046),
  'mega-blaziken': artwork(10050),
  'mega-gardevoir': artwork(10051),
  'mega-manectric': artwork(10055),
  'mega-lucario': artwork(10059),
  'mega-absol': artwork(10057),
  'mega-sceptile': artwork(10065),
  'mega-altaria': artwork(10067),
  'mega-audino': artwork(10069),
  'mega-slowbro': artwork(10071),
  'mega-camerupt': artwork(10087),
}

export const formArtwork = (key: string) => specialArtwork[key]
