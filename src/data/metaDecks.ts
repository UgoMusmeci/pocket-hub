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
  generatedAtLabel: '10/08/2026',
  tournaments: 105,
  players: 0,
  matches: 48053,
  sourceLabel: 'Pokemon Zone / Limitless Pocket',
  sourceUrl: 'https://www.pokemon-zone.com/decks/?name=2026',
}

export const metaDecks: MetaDeckEntry[] = [
  {
    slug: 'meta-zoroark-ex-mega-absol-ex',
    rank: 1,
    archetype: 'Zoroark ex e Mega Absol ex',
    deckCount: 819,
    share: 1.7,
    record: '48 decklist / 819 match',
    winRate: 52.7,
    referenceDeckSlug: 'zoroark-ex-mega-absol-ex',
    representativePokemon: { name: 'Zoroark', sprite: artwork(571) },
    secondaryPokemon: { name: 'Mega Absol', sprite: formArtwork('mega-absol') },
  },
  {
    slug: 'meta-greninja-ex-suicune-ex',
    rank: 2,
    archetype: 'Greninja ex e Suicune ex',
    deckCount: 109,
    share: 0.23,
    record: '6 decklist / 109 match',
    winRate: 51.4,
    referenceDeckSlug: 'greninja-ex-suicune-ex',
    representativePokemon: { name: 'Greninja', sprite: artwork(658) },
    secondaryPokemon: { name: 'Suicune', sprite: artwork(245) },
  },
  {
    slug: 'meta-chien-pao-ex-baxcalibur',
    rank: 3,
    archetype: 'Chien-Pao ex e Baxcalibur',
    deckCount: 3227,
    share: 6.72,
    record: '578 decklist / 3227 match',
    winRate: 51.1,
    referenceDeckSlug: 'chien-pao-ex-baxcalibur',
    representativePokemon: { name: 'Chien-Pao', sprite: artwork(1002) },
    secondaryPokemon: { name: 'Baxcalibur', sprite: artwork(998) },
  },
  {
    slug: 'meta-magnezone-miraidon-ex',
    rank: 4,
    archetype: 'Magnezone e Miraidon ex',
    deckCount: 381,
    share: 0.79,
    record: '18 decklist / 381 match',
    winRate: 49.9,
    referenceDeckSlug: 'bellibolt-ex-magnezone',
    representativePokemon: { name: 'Magnezone', sprite: artwork(462) },
    secondaryPokemon: { name: 'Miraidon', sprite: artwork(1008) },
  },
  {
    slug: 'meta-mega-lucario-ex-lucario',
    rank: 5,
    archetype: 'Mega Lucario ex e Lucario',
    deckCount: 2601,
    share: 5.41,
    record: '83 decklist / 2601 match',
    winRate: 49.4,
    referenceDeckSlug: 'mega-lucario-ex-lucario',
    representativePokemon: { name: 'Mega Lucario', sprite: formArtwork('mega-lucario') },
    secondaryPokemon: { name: 'Lucario', sprite: artwork(448) },
  },
  {
    slug: 'meta-mega-altaria-ex-gourgeist',
    rank: 6,
    archetype: 'Mega Altaria ex e Gourgeist',
    deckCount: 266,
    share: 0.55,
    record: '23 decklist / 266 match',
    winRate: 49.2,
    referenceDeckSlug: 'mega-altaria-ex-gourgeist',
    representativePokemon: { name: 'Mega Altaria', sprite: formArtwork('mega-altaria') },
    secondaryPokemon: { name: 'Gourgeist', sprite: artwork(711) },
  },
  {
    slug: 'meta-mega-manectric-ex-zeraora',
    rank: 7,
    archetype: 'Mega Manectric ex e Zeraora',
    deckCount: 488,
    share: 1.02,
    record: '27 decklist / 488 match',
    winRate: 49,
    referenceDeckSlug: 'mega-manectric-ex-zeraora',
    representativePokemon: { name: 'Mega Manectric', sprite: formArtwork('mega-manectric') },
    secondaryPokemon: { name: 'Zeraora', sprite: artwork(807) },
  },
  {
    slug: 'meta-mega-charizard-y-ex-entei-ex',
    rank: 8,
    archetype: 'Mega Charizard Y ex e Entei ex',
    deckCount: 521,
    share: 1.08,
    record: '41 decklist / 521 match',
    winRate: 48.9,
    referenceDeckSlug: 'mega-charizard-y-ex-entei-ex',
    representativePokemon: { name: 'Mega Charizard Y', sprite: formArtwork('mega-charizard-y') },
    secondaryPokemon: { name: 'Entei', sprite: artwork(244) },
  },
  {
    slug: 'meta-mega-scizor-ex-revavroom',
    rank: 9,
    archetype: 'Mega Scizor ex e Revavroom',
    deckCount: 161,
    share: 0.34,
    record: '13 decklist / 161 match',
    winRate: 46.6,
    referenceDeckSlug: 'mega-scizor-ex-skarmory',
    representativePokemon: { name: 'Mega Scizor', sprite: formArtwork('mega-scizor') },
    secondaryPokemon: { name: 'Revavroom', sprite: artwork(966) },
  },
  {
    slug: 'meta-mega-altaria-ex-greninja',
    rank: 10,
    archetype: 'Mega Altaria ex e Greninja',
    deckCount: 393,
    share: 0.82,
    record: '40 decklist / 393 match',
    winRate: 46.1,
    referenceDeckSlug: 'mega-altaria-ex-greninja',
    representativePokemon: { name: 'Mega Altaria', sprite: formArtwork('mega-altaria') },
    secondaryPokemon: { name: 'Greninja', sprite: artwork(658) },
  },
  {
    slug: 'meta-mega-absol-ex-hydreigon',
    rank: 11,
    archetype: 'Mega Absol ex e Hydreigon',
    deckCount: 491,
    share: 1.02,
    record: '491 match nel dataset',
    winRate: 42.4,
    referenceDeckSlug: 'mega-absol-ex-hydreigon',
    representativePokemon: { name: 'Mega Absol', sprite: formArtwork('mega-absol') },
    secondaryPokemon: { name: 'Hydreigon', sprite: artwork(635) },
  },
]
