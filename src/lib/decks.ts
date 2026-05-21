import { allDeckIdeas, deckIdeas, type DeckCardEntry, type DeckIdea } from '../data/decks'
import { metaDecks } from '../data/metaDecks'
import type { CatalogCard } from '../types/catalog'

function normalizeDeckDate(value: string) {
  const months: Record<string, number> = {
    gennaio: 0,
    febbraio: 1,
    marzo: 2,
    aprile: 3,
    maggio: 4,
    giugno: 5,
    luglio: 6,
    agosto: 7,
    settembre: 8,
    ottobre: 9,
    novembre: 10,
    dicembre: 11,
  }

  const [dayText, monthText, yearText] = value.toLowerCase().split(' ')
  const day = Number.parseInt(dayText, 10)
  const month = months[monthText]
  const year = Number.parseInt(yearText, 10)

  return new Date(year, month, day).getTime()
}

function normalizeLookupName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/pokemon/g, '')
    .replace(/\bmega\b/g, '')
    .replace(/\bex\b/g, '')
    .replace(/\bgalarian\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function getDeckIdeasSortedByRecent() {
  return [...deckIdeas].sort(
    (left, right) => normalizeDeckDate(right.updatedAt) - normalizeDeckDate(left.updatedAt),
  )
}

export function getFeaturedDeckIdeas(limit = 3) {
  return getDeckIdeasSortedByRecent().slice(0, limit)
}

export function getDeckBySlug(slug: string) {
  return allDeckIdeas.find((deck) => deck.slug === slug)
}

export function getMetaDeckBySlug(slug: string) {
  return metaDecks.find((deck) => deck.slug === slug)
}

export function getDeckCardTotal(deck: DeckIdea) {
  return deck.cards.reduce((total, card) => total + card.count, 0)
}

export function findCatalogCard(cards: CatalogCard[], entry: DeckCardEntry) {
  const exactMatch = cards.find((card) => card.name === entry.name)
  if (exactMatch) {
    return exactMatch
  }

  const normalizedEntry = normalizeLookupName(entry.name)

  return cards.find((card) => normalizeLookupName(card.name) === normalizedEntry)
}
