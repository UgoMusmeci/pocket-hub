import type { CatalogCard, CatalogData, CatalogSet } from '../types/catalog'

const setVisualOverrides: Record<string, string> = {
  B1a: '/set-visuals/b1a-crimson-blaze.svg',
  B2a: '/set-visuals/b2a-paldean-wonders.svg',
  B2b: '/set-visuals/b2b-mega-shine.svg',
}

export async function loadCatalog() {
  const response = await fetch('/data/catalog.json')

  if (!response.ok) {
    throw new Error(`Richiesta del catalogo fallita con stato ${response.status}`)
  }

  return (await response.json()) as CatalogData
}

export function normalizeSearchText(card: CatalogCard) {
  return [
    card.name,
    card.localId,
    card.setId,
    card.setName,
    card.category,
    card.rarity ?? '',
    card.stage ?? '',
    card.suffix ?? '',
    card.illustrator ?? '',
    ...card.types,
    ...card.attacks.flatMap((attack) => [
      attack.name,
      attack.damage ?? '',
      attack.effect ?? '',
      ...(attack.cost ?? []),
    ]),
    ...card.weaknesses.flatMap((weakness) => [weakness.type, weakness.value ?? '']),
  ]
    .join(' ')
    .toLowerCase()
}

export function getPrimaryType(card: CatalogCard) {
  return card.types[0] ?? card.category
}

const typeLabels: Record<string, string> = {
  Grass: 'Erba',
  Fire: 'Fuoco',
  Water: 'Acqua',
  Electric: 'Lampo',
  Lightning: 'Lampo',
  Psychic: 'Psico',
  Fighting: 'Lotta',
  Darkness: 'Oscurità',
  Metal: 'Metallo',
  Dragon: 'Drago',
  Colorless: 'Incolore',
}

const rarityLabels: Record<string, string> = {
  'One Diamond': '1 diamante',
  'Two Diamond': '2 diamanti',
  'Three Diamond': '3 diamanti',
  'Four Diamond': '4 diamanti',
  'One Star': '1 stella',
  'Two Star': '2 stelle',
  'Three Star': '3 stelle',
  'One Shiny': '1 shiny',
  'Two Shiny': '2 shiny',
  Crown: 'Corona',
  Rare: 'Rara',
  'Double Rare': 'Doppia rara',
}

const rarityIcons: Record<string, string> = {
  'One Diamond': '◇',
  'Two Diamond': '◇◇',
  'Three Diamond': '◇◇◇',
  'Four Diamond': '◇◇◇◇',
  'One Star': '☆',
  'Two Star': '☆☆',
  'Three Star': '☆☆☆',
  'One Shiny': '✦',
  'Two Shiny': '✦✦',
  Crown: '♛',
  Rare: 'R',
  'Double Rare': 'RR',
  None: 'Promo',
}

const categoryLabels: Record<string, string> = {
  Pokemon: 'Pokemon',
  Trainer: 'Allenatore',
  Supporter: 'Aiuto',
  Stadium: 'Stadio',
  'Pokemon Tool': 'Strumento Pokemon',
  'Pokémon Tool': 'Strumento Pokemon',
  'PokÃ©mon Tool': 'Strumento Pokemon',
  Item: 'Oggetto',
  Unknown: 'Categoria da verificare',
}

const sourceLabels: Record<string, string> = {
  tcgdex: 'TCGdex',
  'serebii-fallback': 'Importazione di emergenza Serebii',
  'game8-fallback': 'Importazione di emergenza Game8',
}

const stageLabels: Record<string, string> = {
  Basic: 'Base',
  'Stage 1': 'Livello 1',
  'Stage 2': 'Livello 2',
  Baby: 'Baby',
}

const suffixLabels: Record<string, string> = {
  EX: 'ex',
  ex: 'ex',
  MEGA: 'Mega',
}

const cardNameLabels: Record<string, string> = {
  "Professor's Research": 'Ricerca del Professore',
  'Poke Ball': 'Pokeball',
  'Rare Candy': 'Caramella Rara',
  Copycat: 'Copia',
  Leaf: 'Leaf',
  'Lucky Ice Pop': 'Ghiacciolo fortunato',
  'Protective Poncho': 'Poncho protettivo',
  'Metal Core Barrier': 'Barriera nucleo metallico',
  Sightseer: 'Turista',
  'Giant Cape': 'Mantello gigante',
  'Starting Plains': 'Pianure iniziali',
  'Rocky Helmet': 'Casco roccioso',
  'Poison Barb': 'Aculeo velenoso',
  'Training Area': 'Area di allenamento',
  'Steel Apron': 'Grembiule d acciaio',
  'Inflatable Boat': 'Barca gonfiabile',
  'Pokemon Center Lady': 'Infermiera del Centro Pokemon',
  Erika: 'Erika',
  Guzma: 'Guzma',
}

export function localizeType(type: string) {
  return typeLabels[type] ?? type
}

export function localizeTypes(types: string[]) {
  return types.map(localizeType)
}

export function localizeRarity(rarity?: string) {
  if (!rarity) {
    return 'Rarità non disponibile'
  }

  return rarityLabels[rarity] ?? rarity
}

export function getRarityIcon(rarity?: string) {
  if (!rarity) {
    return '•'
  }

  return rarityIcons[rarity] ?? '•'
}

export function localizeCategory(category: string) {
  return categoryLabels[category] ?? category
}

export function localizeSource(source: string) {
  return sourceLabels[source] ?? source
}

export function localizeStage(stage?: string) {
  if (!stage) {
    return 'Non disponibile'
  }

  return stageLabels[stage] ?? stage
}

export function localizeSuffix(suffix?: string) {
  if (!suffix) {
    return 'Nessun suffisso speciale'
  }

  return suffixLabels[suffix] ?? suffix
}

export function localizeCardName(name: string) {
  return cardNameLabels[name] ?? name
}

function normalizeTcgdexAssetUrl(url?: string) {
  if (!url) {
    return undefined
  }

  if (url.includes('assets.tcgdex.net') && !/\.[a-z0-9]+$/i.test(url)) {
    return `${url}.png`
  }

  return url
}

export function getSetVisualUrl(set: CatalogSet) {
  return (
    normalizeTcgdexAssetUrl(set.logo) ??
    normalizeTcgdexAssetUrl(set.symbol) ??
    setVisualOverrides[set.id] ??
    null
  )
}

function parseCatalogDate(date: string) {
  const parsed = new Date(date)

  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

  const normalized = date.replace(/(\d{1,2})th/g, '$1')
  const retry = new Date(normalized)

  return Number.isNaN(retry.getTime()) ? null : retry
}

export function compareCatalogDatesDesc(left: string, right: string) {
  const leftDate = parseCatalogDate(left)
  const rightDate = parseCatalogDate(right)

  if (!leftDate && !rightDate) {
    return 0
  }

  if (!leftDate) {
    return 1
  }

  if (!rightDate) {
    return -1
  }

  return rightDate.getTime() - leftDate.getTime()
}

export function formatCatalogDate(date: string) {
  const parsed = parseCatalogDate(date)

  if (!parsed) {
    return date
  }

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed)
}

export function getCardImageUrl(card: CatalogCard) {
  if (card.localImage) {
    return card.localImage
  }

  if (!card.image) {
    return null
  }

  if (card.image.startsWith('undefined/')) {
    return null
  }

  if (card.source === 'serebii-fallback') {
    return card.image.replace('/tcgpocket/th/', '/tcgpocket/')
  }

  return card.image
}

export function getAlternateCardImageUrl(url: string) {
  if (/\.webp(?:$|\?)/i.test(url)) {
    return url.replace(/\.webp(?=$|\?)/i, '.jpg')
  }

  if (/\.jpe?g(?:$|\?)/i.test(url)) {
    return url.replace(/\.jpe?g(?=$|\?)/i, '.webp')
  }

  return null
}

export function handleCardImageError(image: HTMLImageElement, emptyClass?: string) {
  const currentUrl = image.getAttribute('src') ?? image.src
  const alternateUrl =
    image.dataset.altImageTried === 'true' ? null : getAlternateCardImageUrl(currentUrl)

  if (alternateUrl && alternateUrl !== currentUrl) {
    image.dataset.altImageTried = 'true'
    image.src = alternateUrl
    return
  }

  if (emptyClass) {
    image.parentElement?.classList.add(emptyClass)
  }

  image.remove()
}
