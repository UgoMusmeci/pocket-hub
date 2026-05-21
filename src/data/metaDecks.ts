export type MetaDeckSnapshot = {
  generatedAtLabel: string
  tournaments: number
  players: number
  matches: number
  sourceLabel: string
  sourceUrl: string
}

import { artwork, formArtwork } from './deckTypes'

export type MetaDeckEntry = {
  slug: string
  rank: number
  archetype: string
  deckCount: number
  share: number
  record: string
  winRate: number
  referenceDeckSlug: string
  representativePokemon: {
    name: string
    sprite: string
  }
  secondaryPokemon: {
    name: string
    sprite: string
  }
}

export const metaDeckSnapshot: MetaDeckSnapshot = {
  generatedAtLabel: '10/04/2026',
  tournaments: 77,
  players: 10217,
  matches: 27433,
  sourceLabel: 'Limitless Pocket',
  sourceUrl: 'https://play.limitlesstcg.com/decks?game=pocket',
}

export const metaDecks: MetaDeckEntry[] = [
  {
    slug: 'meta-suicune-ex-baxcalibur',
    rank: 1,
    archetype: 'Suicune ex e Baxcalibur',
    deckCount: 1092,
    share: 10.69,
    record: '3236-2842-130',
    winRate: 52.13,
    referenceDeckSlug: 'chien-pao-ex-baxcalibur',
    representativePokemon: { name: 'Suicune', sprite: artwork(245) },
    secondaryPokemon: { name: 'Baxcalibur', sprite: artwork(998) },
  },
  {
    slug: 'meta-mega-altaria-ex-igglybuff',
    rank: 4,
    archetype: 'Mega Altaria ex e Igglybuff',
    deckCount: 681,
    share: 6.67,
    record: '1948-1837-78',
    winRate: 50.43,
    referenceDeckSlug: 'darkrai-mega-altaria-ex',
    representativePokemon: { name: 'Mega Altaria', sprite: formArtwork('mega-altaria') },
    secondaryPokemon: { name: 'Igglybuff', sprite: artwork(174) },
  },
  {
    slug: 'meta-mega-charizard-x-ex-mega-charizard-y-ex',
    rank: 3,
    archetype: 'Mega Charizard X ex e Mega Charizard Y ex',
    deckCount: 779,
    share: 7.62,
    record: '2014-2057-67',
    winRate: 48.67,
    referenceDeckSlug: 'mega-charizard-ex-entei-ex',
    representativePokemon: { name: 'Mega Charizard X', sprite: formArtwork('mega-charizard-x') },
    secondaryPokemon: { name: 'Mega Charizard Y', sprite: formArtwork('mega-charizard-y') },
  },
  {
    slug: 'meta-hydreigon-mega-absol-ex',
    rank: 2,
    archetype: 'Hydreigon e Mega Absol ex',
    deckCount: 995,
    share: 9.74,
    record: '3006-2593-141',
    winRate: 52.37,
    referenceDeckSlug: 'mega-absol-ex-hydreigon',
    representativePokemon: { name: 'Hydreigon', sprite: artwork(635) },
    secondaryPokemon: { name: 'Mega Absol', sprite: formArtwork('mega-absol') },
  },
  {
    slug: 'meta-mega-scizor-ex-revavroom',
    rank: 5,
    archetype: 'Mega Scizor ex e Revavroom',
    deckCount: 548,
    share: 5.36,
    record: '1422-1457-52',
    winRate: 48.52,
    referenceDeckSlug: 'mega-scizor-ex-skarmory',
    representativePokemon: { name: 'Mega Scizor', sprite: formArtwork('mega-scizor') },
    secondaryPokemon: { name: 'Revavroom', sprite: artwork(966) },
  },
  {
    slug: 'meta-mega-manectric-ex-zeraora',
    rank: 6,
    archetype: 'Mega Manectric ex e Zeraora',
    deckCount: 423,
    share: 4.14,
    record: '1247-1076-76',
    winRate: 51.98,
    referenceDeckSlug: 'mega-manectric-ex-zeraora',
    representativePokemon: { name: 'Mega Manectric', sprite: formArtwork('mega-manectric') },
    secondaryPokemon: { name: 'Zeraora', sprite: artwork(807) },
  },
  {
    slug: 'meta-mega-charizard-y-ex-mega-charizard-x-ex',
    rank: 21,
    archetype: 'Mega Charizard Y ex e Entei ex',
    deckCount: 82,
    share: 0.8,
    record: '238-211-10',
    winRate: 51.85,
    referenceDeckSlug: 'mega-charizard-y-ex-entei-ex',
    representativePokemon: { name: 'Mega Charizard Y', sprite: formArtwork('mega-charizard-y') },
    secondaryPokemon: { name: 'Entei', sprite: artwork(244) },
  },
  {
    slug: 'meta-mega-manectric-ex-oricorio',
    rank: 10,
    archetype: 'Mega Manectric ex e Oricorio',
    deckCount: 181,
    share: 1.77,
    record: '386-502-17',
    winRate: 42.65,
    referenceDeckSlug: 'magnezone-oricorio-pom-pom',
    representativePokemon: { name: 'Mega Manectric', sprite: formArtwork('mega-manectric') },
    secondaryPokemon: { name: 'Oricorio', sprite: artwork(741) },
  },
  {
    slug: 'meta-magnezone-teal-mask-ogerpon-ex',
    rank: 11,
    archetype: 'Magnezone e Teal Mask Ogerpon ex',
    deckCount: 179,
    share: 1.75,
    record: '563-446-26',
    winRate: 54.4,
    referenceDeckSlug: 'bellibolt-ex-magnezone',
    representativePokemon: { name: 'Magnezone', sprite: artwork(462) },
    secondaryPokemon: { name: 'Ogerpon', sprite: artwork(1017) },
  },
  {
    slug: 'meta-mega-altaria-ex-greninja',
    rank: 7,
    archetype: 'Mega Altaria ex e Greninja',
    deckCount: 408,
    share: 3.99,
    record: '1256-1065-60',
    winRate: 52.75,
    referenceDeckSlug: 'mega-altaria-ex-greninja',
    representativePokemon: { name: 'Mega Altaria', sprite: formArtwork('mega-altaria') },
    secondaryPokemon: { name: 'Greninja', sprite: artwork(658) },
  },
  {
    slug: 'meta-mega-altaria-ex-gourgeist',
    rank: 12,
    archetype: 'Mega Altaria ex e Gourgeist',
    deckCount: 165,
    share: 1.61,
    record: '428-427-16',
    winRate: 49.14,
    referenceDeckSlug: 'mega-altaria-ex-gourgeist',
    representativePokemon: { name: 'Mega Altaria', sprite: formArtwork('mega-altaria') },
    secondaryPokemon: { name: 'Gourgeist', sprite: artwork(711) },
  },
  {
    slug: 'meta-gourgeist-houndstone',
    rank: 22,
    archetype: 'Gourgeist e Houndstone',
    deckCount: 82,
    share: 0.8,
    record: '217-223-7',
    winRate: 48.55,
    referenceDeckSlug: 'gourgeist-houndstone',
    representativePokemon: { name: 'Gourgeist', sprite: artwork(711) },
    secondaryPokemon: { name: 'Houndstone', sprite: artwork(972) },
  },
]
