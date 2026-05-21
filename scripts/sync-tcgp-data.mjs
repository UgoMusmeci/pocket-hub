import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const API_ROOT = 'https://api.tcgdex.net/v2/en'
const POKEAPI_ROOT = 'https://pokeapi.co/api/v2'
const SERIES_ID = 'tcgp'
const GAME8_COMPLETE_DEX_URL =
  'https://game8.co/games/Pokemon-TCG-Pocket/archives/482685'
const SEREBII_BASE_URL = 'https://www.serebii.net/tcgpocket'
const MANUAL_SET_OVERRIDES = {
  B2b: {
    releaseDate: 'March 26, 2026',
  },
  'P-A': {
    name: 'Promo-A',
  },
  'P-B': {
    name: 'Promo-B',
  },
}
const MANUAL_CARD_OVERRIDES = {
  'A1-265': {
    rarity: 'Two Star',
  },
  'A1-279': {
    rarity: 'Two Star',
  },
  'B2b-014': {
    stage: 'Basic',
  },
  'P-A-104': {
    stage: 'Stage 1',
    attacks: [
      {
        name: 'Aqua Edge',
        damage: '60',
        effect: undefined,
        cost: ['Water', 'Colorless'],
      },
    ],
  },
  'P-A-109': {
    category: 'Pokemon',
    hp: 90,
    stage: 'Basic',
    weaknesses: [{ type: 'Fighting', value: '+20' }],
    retreat: 1,
  },
  'P-B-032': {
    stage: 'Basic',
  },
  'P-B-040': {
    stage: 'Stage 1',
  },
  'B2b-065': {
    category: 'Item',
  },
  'B2b-066': {
    category: 'Item',
  },
  'B3-024': {
    stage: 'Basic',
  },
  'B3-036': {
    stage: 'Basic',
  },
  'B3-040': {
    stage: 'Basic',
  },
  'B3-041': {
    stage: 'Basic',
  },
  'B3-051': {
    stage: 'Stage 1',
  },
  'B3-113': {
    stage: 'Stage 1',
  },
  'B3-147': {
    category: 'Item',
  },
  'B3-224': {
    stage: 'Stage 2',
  },
  'P-B-057': {
    stage: 'Basic',
  },
}
const MANUAL_SEREBII_SETS = [
  {
    id: 'B2b',
    name: 'Mega Shine',
    slug: 'megashine',
    releaseDate: 'March 26, 2026',
  },
  {
    id: 'P-A',
    name: 'Promo-A',
    slug: 'promo-a',
    releaseDate: 'October 30, 2024',
  },
  {
    id: 'P-B',
    name: 'Promo-B',
    slug: 'promo-b',
    releaseDate: 'October 30, 2025',
  },
]
const OUTPUT_DIR = path.resolve('public', 'data')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'catalog.json')
const CONCURRENCY = 16
const SEREBII_DETAIL_CONCURRENCY = 8
const speciesStageCache = new Map()
const evolutionChainCache = new Map()

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}`)
  }

  return response.json()
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (compatible; PokemonPocketCatalogBot/1.0; +https://example.com)',
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}`)
  }

  return response.text()
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length)
  let index = 0

  async function worker() {
    while (index < items.length) {
      const currentIndex = index
      index += 1
      results[currentIndex] = await mapper(items[currentIndex], currentIndex)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  )

  return results
}

function normalizeSet(set) {
  const override = MANUAL_SET_OVERRIDES[set.id] ?? {}

  return {
    id: set.id,
    name: override.name ?? set.name,
    releaseDate: override.releaseDate ?? set.releaseDate,
    officialCardCount: set.cardCount.official,
    totalCardCount: set.cardCount.total,
    source: 'tcgdex',
    sourceUrl: `${API_ROOT}/sets/${set.id}`,
    symbol: set.symbol,
    logo: set.logo,
  }
}

function normalizeCard(card) {
  const override = MANUAL_CARD_OVERRIDES[card.id] ?? {}
  const setOverride = MANUAL_SET_OVERRIDES[card.set.id] ?? {}
  const normalizedCategory =
    override.category ??
    (card.category === 'Trainer'
      ? normalizeTcgdexTrainerCategory(card.trainerType)
      : card.category)

  const imageUrl = `${card.image}/low.webp`

  return {
    id: card.id,
    localId: card.localId,
    name: card.name,
    category: normalizedCategory,
    rarity: override.rarity ?? card.rarity,
    hp: override.hp ?? card.hp,
    stage: override.stage ?? card.stage,
    suffix: card.suffix,
    types: card.types ?? [],
    setId: card.set.id,
    setName: setOverride.name ?? card.set.name,
    source: 'tcgdex',
    image: imageUrl,
    localImage: getLocalCardImagePath(card.id, imageUrl),
    attacks: (override.attacks ?? card.attacks ?? []).map((attack) => ({
      name: attack.name,
      damage: attack.damage,
      effect: attack.effect,
      cost: attack.cost ?? [],
    })),
    weaknesses: (override.weaknesses ?? card.weaknesses ?? []).map((weakness) => ({
      type: weakness.type,
      value: weakness.value,
    })),
    retreat: override.retreat ?? card.retreat,
    illustrator: card.illustrator,
    updated: card.updated,
  }
}

function normalizeTcgdexTrainerCategory(trainerType) {
  const mapping = {
    Supporter: 'Supporter',
    Stadium: 'Stadium',
    Item: 'Item',
    Tool: 'Pokémon Tool',
    'Pokemon Tool': 'Pokémon Tool',
    'Pokémon Tool': 'Pokémon Tool',
  }

  return mapping[trainerType] ?? 'Trainer'
}

function hasBrokenImage(card) {
  return !card?.image || card.image.startsWith('undefined/')
}

function hasNonEmptyValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function hasNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0
}

function isMeaningfulCategory(value) {
  return hasNonEmptyValue(value) && value !== 'Unknown'
}

function choosePreferredValue(primaryValue, fallbackValue, isFallbackPreferred) {
  if (!hasNonEmptyValue(fallbackValue)) {
    return primaryValue
  }

  if (!hasNonEmptyValue(primaryValue)) {
    return fallbackValue
  }

  return isFallbackPreferred ? fallbackValue : primaryValue
}

function choosePreferredArray(primaryValue, fallbackValue, isFallbackPreferred) {
  if (!hasNonEmptyArray(fallbackValue)) {
    return primaryValue
  }

  if (!hasNonEmptyArray(primaryValue)) {
    return fallbackValue
  }

  return isFallbackPreferred ? fallbackValue : primaryValue
}

function mergeCardData(primaryCard, fallbackCard) {
  const shouldPreferFallbackDetails =
    primaryCard.source === 'game8-fallback' && fallbackCard.source === 'serebii-fallback'

  const mergedCategory =
    !isMeaningfulCategory(primaryCard.category) && isMeaningfulCategory(fallbackCard.category)
      ? fallbackCard.category
      : shouldPreferFallbackDetails && isMeaningfulCategory(fallbackCard.category)
        ? fallbackCard.category
        : primaryCard.category

  const mergedName =
    shouldPreferFallbackDetails &&
    hasNonEmptyValue(fallbackCard.name) &&
    fallbackCard.name.length >= primaryCard.name.length
      ? fallbackCard.name
      : primaryCard.name

  return {
    ...primaryCard,
    name: mergedName,
    category: mergedCategory,
    rarity: choosePreferredValue(primaryCard.rarity, fallbackCard.rarity, shouldPreferFallbackDetails),
    hp: choosePreferredValue(primaryCard.hp, fallbackCard.hp, shouldPreferFallbackDetails),
    stage: choosePreferredValue(primaryCard.stage, fallbackCard.stage, shouldPreferFallbackDetails),
    suffix: choosePreferredValue(primaryCard.suffix, fallbackCard.suffix, shouldPreferFallbackDetails),
    types: choosePreferredArray(primaryCard.types, fallbackCard.types, shouldPreferFallbackDetails),
    image:
      hasBrokenImage(primaryCard) || shouldPreferFallbackDetails
        ? choosePreferredValue(primaryCard.image, fallbackCard.image, shouldPreferFallbackDetails)
        : primaryCard.image,
    localImage:
      hasBrokenImage(primaryCard) || shouldPreferFallbackDetails
        ? choosePreferredValue(primaryCard.localImage, fallbackCard.localImage, shouldPreferFallbackDetails)
        : primaryCard.localImage,
    attacks: choosePreferredArray(primaryCard.attacks, fallbackCard.attacks, shouldPreferFallbackDetails),
    weaknesses: choosePreferredArray(
      primaryCard.weaknesses,
      fallbackCard.weaknesses,
      shouldPreferFallbackDetails,
    ),
    retreat: choosePreferredValue(primaryCard.retreat, fallbackCard.retreat, shouldPreferFallbackDetails),
    illustrator: choosePreferredValue(
      primaryCard.illustrator,
      fallbackCard.illustrator,
      shouldPreferFallbackDetails,
    ),
    updated: choosePreferredValue(primaryCard.updated, fallbackCard.updated, false),
    source:
      hasBrokenImage(primaryCard) || shouldPreferFallbackDetails
        ? fallbackCard.source
        : primaryCard.source,
  }
}

function uniqueBy(items, keySelector) {
  const seen = new Set()

  return items.filter((item) => {
    const key = keySelector(item)
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function decodeHtml(value) {
  return value
    .replaceAll('&eacute;', 'é')
    .replaceAll('&Eacute;', 'É')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('Pok&eacute;mon', 'Pokemon')
    .trim()
}

function stripHtmlTags(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function toSerebiiSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function formatRarityFromAsset(assetName) {
  const mappings = {
    promo: 'None',
    diamond1: 'One Diamond',
    diamond2: 'Two Diamond',
    diamond3: 'Three Diamond',
    diamond4: 'Four Diamond',
    star1: 'One Star',
    star2: 'Two Star',
    star3: 'Three Star',
    shiny1: 'One Shiny',
    shiny2: 'Two Shiny',
    crown: 'Crown',
  }

  return mappings[assetName] ?? assetName
}

function normalizeSerebiiType(value) {
  const normalized = value.toLowerCase()
  const mapping = {
    grass: 'Grass',
    fire: 'Fire',
    water: 'Water',
    electric: 'Lightning',
    lightning: 'Lightning',
    psychic: 'Psychic',
    fighting: 'Fighting',
    darkness: 'Darkness',
    dark: 'Darkness',
    metal: 'Metal',
    steel: 'Metal',
    colorless: 'Colorless',
    dragon: 'Dragon',
  }

  return mapping[normalized] ?? value[0].toUpperCase() + value.slice(1)
}

function normalizeSerebiiCategory(value, hasHp = false) {
  const normalized = decodeHtml(value || '').trim()
  const mapping = {
    Pokemon: 'Pokemon',
    Trainer: 'Trainer',
    Supporter: 'Supporter',
    Stadium: 'Stadium',
    'Pokemon Tool': 'Pokémon Tool',
    'Pokémon Tool': 'Pokémon Tool',
    Item: 'Item',
  }

  if (mapping[normalized]) {
    return mapping[normalized]
  }

  return hasHp ? 'Pokemon' : 'Trainer'
}

function normalizePokemonLookupName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bmega\b/gi, '')
    .replace(/\bex\b/gi, '')
    .replace(/[.'’:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const POKEAPI_SPECIES_OVERRIDES = {
  'Paldean Wooper': 'wooper-paldea',
  'Paldean Tauros': 'tauros-paldea-combat',
  'Wo-Chien': 'wo-chien',
  'Chi-Yu': 'chi-yu',
  'Chien-Pao': 'chien-pao',
  'Ting-Lu': 'ting-lu',
}

function toPokeApiSpeciesSlug(name) {
  const normalizedName = normalizePokemonLookupName(name)
  if (POKEAPI_SPECIES_OVERRIDES[normalizedName]) {
    return POKEAPI_SPECIES_OVERRIDES[normalizedName]
  }

  return normalizedName.toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, '-')
}

async function fetchEvolutionChain(url) {
  if (!evolutionChainCache.has(url)) {
    evolutionChainCache.set(url, fetchJson(url))
  }

  return evolutionChainCache.get(url)
}

function findEvolutionDepth(chain, speciesName, depth = 0) {
  if (chain.species?.name === speciesName) {
    return depth
  }

  for (const child of chain.evolves_to ?? []) {
    const childDepth = findEvolutionDepth(child, speciesName, depth + 1)
    if (childDepth !== null) {
      return childDepth
    }
  }

  return null
}

async function getPokemonStage(name) {
  const speciesSlug = toPokeApiSpeciesSlug(name)

  if (!speciesStageCache.has(speciesSlug)) {
    speciesStageCache.set(
      speciesSlug,
      (async () => {
        try {
          const species = await fetchJson(`${POKEAPI_ROOT}/pokemon-species/${speciesSlug}`)

          if (species.is_baby) {
            return 'Baby'
          }

          if (!species.evolution_chain?.url) {
            return species.evolves_from_species ? 'Stage 1' : 'Basic'
          }

          const evolutionChain = await fetchEvolutionChain(species.evolution_chain.url)
          const depth = findEvolutionDepth(evolutionChain.chain, species.name)

          if (depth === null || depth === 0) {
            return 'Basic'
          }

          return depth >= 2 ? 'Stage 2' : 'Stage 1'
        } catch (error) {
          console.warn(`Could not resolve stage for ${name} via PokeAPI.`)
          return undefined
        }
      })(),
    )
  }

  return speciesStageCache.get(speciesSlug)
}

function compareSetCodes(left, right) {
  const pattern = /^([A-Z])(\d+)([a-z]*)$/
  const leftMatch = left.match(pattern)
  const rightMatch = right.match(pattern)

  if (!leftMatch || !rightMatch) {
    return left.localeCompare(right, undefined, { numeric: true })
  }

  const [, leftSeries, leftNumber, leftSuffix] = leftMatch
  const [, rightSeries, rightNumber, rightSuffix] = rightMatch

  if (leftSeries !== rightSeries) {
    return leftSeries.localeCompare(rightSeries)
  }

  if (leftNumber !== rightNumber) {
    return Number.parseInt(leftNumber, 10) - Number.parseInt(rightNumber, 10)
  }

  return leftSuffix.localeCompare(rightSuffix)
}

function parseGame8SetLinks(html) {
  const buttonMatches = html.matchAll(
    /href="(?<path>\/games\/Pokemon-TCG-Pocket\/archives\/\d+)"[^>]*>\s*<span>(?<title>(?<name>.*?) \((?<code>[A-Z]\d[a-z]?)\) Card List)<\/span>/g,
  )
  const anchorMatches = html.matchAll(
    /href="(?<path>\/games\/Pokemon-TCG-Pocket\/archives\/\d+)"[^>]*>\s*(?:<img[^>]+>)?\s*(?<name>[A-Za-z0-9' .:-]+?) \((?<code>[A-Z]\d[a-z]?)\)\s*<\/a>/g,
  )

  return uniqueBy(
    [
      ...Array.from(buttonMatches, (match) => ({
        url: `https://game8.co${match.groups.path}`,
        title: match.groups.title.trim(),
        name: match.groups.name.trim(),
        code: match.groups.code.trim(),
      })),
      ...Array.from(anchorMatches, (match) => ({
        url: `https://game8.co${match.groups.path}`,
        title: match.groups.name.trim(),
        name: match.groups.name.trim(),
        code: match.groups.code.trim(),
      })),
    ],
    (entry) => entry.code,
  )
}

function parseGame8ReleaseDate(html) {
  const releaseMatch = html.match(
    /Released on:\s*<\/strong>\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i,
  )

  if (releaseMatch) {
    return releaseMatch[1]
  }

  const paragraphMatch = html.match(
    /released on\s*<b[^>]*>\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})\s*<\/b>/i,
  )
  if (paragraphMatch) {
    return paragraphMatch[1]
  }

  const descriptionMatch = html.match(
    /(?:\([A-Z]\d[a-z]?\)\s*)?released on ([A-Za-z]+\s+\d{1,2},\s+\d{4})/i,
  )
  if (descriptionMatch) {
    return descriptionMatch[1]
  }

  const altMatch = html.match(/Released:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i)
  return altMatch?.[1] ?? ''
}

function parseGame8Cards(html, setCode, setName) {
  const cardMatches = html.matchAll(
    new RegExp(
      String.raw`data-image-url='(?<image>[^']+)'[\s\S]{0,500}?alt='Pokemon TCG Pocket-\s*(?<name>.*?)\((?<code>${setCode}\s*(?<localId>\d{3}))\)'`,
      'g',
    ),
  )

  const cards = Array.from(cardMatches, (match) => {
    const localId = match.groups.localId.trim()
    const image = match.groups.image.replace(/\/original$/, '/show')

    return {
      id: `${setCode}-${localId}`,
      localId,
      name: match.groups.name.trim(),
      category: 'Unknown',
      rarity: undefined,
      hp: undefined,
      stage: undefined,
      suffix: match.groups.name.includes(' ex') ? 'EX' : undefined,
      types: [],
      setId: setCode,
      setName,
      source: 'game8-fallback',
      image,
      localImage: getLocalCardImagePath(`${setCode}-${localId}`, image),
      attacks: [],
      weaknesses: [],
      retreat: undefined,
      illustrator: undefined,
      updated: undefined,
    }
  })

  return uniqueBy(cards, (card) => card.id)
}

function parseSerebiiReleaseDate(html) {
  const match = html.match(/Released on ([A-Za-z]+ \d{1,2}, \d{4})/i)
  return match?.[1] ?? ''
}

function parseSerebiiCards(html, setCode, setName, slug) {
  const isPromoSet = setCode.startsWith('P-')
  const rowPattern = new RegExp(
    isPromoSet
      ? String.raw`<tr>\s*<td class="cen"><a href="/tcgpocket/${slug}/">[\s\S]*?<br \/>(?<localId>\d+)\s*\/\s*${setCode}<br[\s\S]*?<img src="/tcgpocket/image/(?<rarity>[^".]+)\.png"[\s\S]*?<a href="/tcgpocket/${slug}\/(?<pageId>\d+)\.shtml"><img src="(?<thumb>[^"]+)"[\s\S]*?<td class="cen"[^>]*><a href="/tcgpocket/${slug}\/\d+\.shtml">(?<nameHtml>[\s\S]*?)<\/a><\/td>\s*<td align="right" class="fooinfo"[^>]*>(?<details>[\s\S]*?)<\/td>`
      : String.raw`<tr>\s*<td class="cen"><a href="/tcgpocket/${slug}/">[\s\S]*?<br \/>(?<localId>\d+)\s*\/\s*(?<official>\d+)<br \/><img src="/tcgpocket/image/(?<rarity>[^".]+)\.png"[\s\S]*?<a href="/tcgpocket/${slug}\/(?<pageId>\d+)\.shtml"><img src="(?<thumb>[^"]+)"[\s\S]*?<td class="cen"[^>]*><a href="/tcgpocket/${slug}\/\d+\.shtml">(?<nameHtml>[\s\S]*?)<\/a><\/td>\s*<td align="right" class="fooinfo"[^>]*>(?<details>[\s\S]*?)<\/td>`,
    'g',
  )

  const cards = Array.from(html.matchAll(rowPattern), (match) => {
    const details = match.groups.details
    const cardName = decodeHtml(stripHtmlTags(match.groups.nameHtml))
    const hpMatch = details.match(/<b>(\d+)HP<\/b>/i)
    const typeMatch = details.match(/\/tcgpocket\/image\/([a-z]+)\.png/i)
    const weaknessMatch = details.match(
      /<td width="33%" align="center"><img border="0" src="\/tcgpocket\/image\/([a-z]+)\.png"[\s\S]*?>([^<]+)</i,
    )
    const categoryMatch = details.match(/<div align="right">([^<]+)<\/div>/i)
    const retreatCost =
      details.match(/\/tcgpocket\/image\/colorless\.png/gi)?.length ?? 0
    const category = normalizeSerebiiCategory(categoryMatch?.[1], Boolean(hpMatch))
    const primaryType = typeMatch ? normalizeSerebiiType(decodeHtml(typeMatch[1])) : undefined

    const image = `https://www.serebii.net${match.groups.thumb}`

    return {
      id: `${setCode}-${match.groups.localId.padStart(3, '0')}`,
      localId: match.groups.localId.padStart(3, '0'),
      name: cardName,
      category,
      rarity: formatRarityFromAsset(match.groups.rarity),
      hp: hpMatch ? Number.parseInt(hpMatch[1], 10) : undefined,
      stage: undefined,
      suffix: / ex$/i.test(cardName) ? 'EX' : undefined,
      types: primaryType
        ? [primaryType[0].toUpperCase() + primaryType.slice(1)]
        : [],
      setId: setCode,
      setName,
      source: 'serebii-fallback',
      image,
      localImage: getLocalCardImagePath(
        `${setCode}-${match.groups.localId.padStart(3, '0')}`,
        image,
      ),
      attacks: [],
      weaknesses: weaknessMatch
        ? [
            {
              type:
                weaknessMatch[1][0].toUpperCase() + weaknessMatch[1].slice(1),
              value: decodeHtml(weaknessMatch[2]),
            },
          ]
        : [],
      retreat: hpMatch ? retreatCost : undefined,
      illustrator: undefined,
      updated: undefined,
      officialCount: match.groups.official
        ? Number.parseInt(match.groups.official, 10)
        : undefined,
      pageId: match.groups.pageId,
    }
  })

  return uniqueBy(cards, (card) => card.id)
}

function parseSerebiiCardPageDetails(html, card) {
  const illustratorMatch = html.match(/Illustration:\s*<a[^>]*><u>(.*?)<\/u><\/a>/i)
  const attackMatches = html.matchAll(
    /<tr>\s*<td align="center" width="15%">([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td colspan="2" align="center" class="main"><b>(.*?)<\/b><\/td>\s*<\/tr>/gi,
  )

  const attacks = Array.from(attackMatches, (match) => {
    const cost = Array.from(match[1].matchAll(/\/card\/image\/([a-z-]+)\.png/gi), (entry) =>
      normalizeSerebiiType(entry[1]),
    )
    const body = stripHtmlTags(match[2])
    const [name, ...effectParts] = body.split(/\s{2,}/).filter(Boolean)

    return {
      name: decodeHtml(name ?? '').trim(),
      damage: stripHtmlTags(match[3]).trim() || undefined,
      effect: effectParts.join(' ').trim() || undefined,
      cost,
    }
  }).filter((attack) => attack.name)

  return {
    attacks,
    illustrator: illustratorMatch ? decodeHtml(illustratorMatch[1]) : undefined,
  }
}

async function fetchSerebiiSet(setCode, setName, releaseDateFallback = '', slugOverride = '') {
  const slug = slugOverride || toSerebiiSlug(setName)
  const url = `${SEREBII_BASE_URL}/${slug}/`
  const html = await fetchText(url)

  if (!html.includes('Pok') || !html.includes(setName.split(' ')[0])) {
    throw new Error(`Unexpected Serebii payload for ${setCode}`)
  }

  const parsedCards = parseSerebiiCards(html, setCode, setName, slug)
  const enrichedCards = await mapLimit(
    parsedCards,
    SEREBII_DETAIL_CONCURRENCY,
    async (rawCard) => {
      const pageUrl = `${SEREBII_BASE_URL}/${slug}/${rawCard.pageId}.shtml`
      let details = {
        attacks: rawCard.attacks,
        illustrator: rawCard.illustrator,
      }

      try {
        const pageHtml = await fetchText(pageUrl)
        details = parseSerebiiCardPageDetails(pageHtml, rawCard)
      } catch (error) {
        console.warn(
          `Could not fetch Serebii detail page for ${rawCard.id}.`,
          error instanceof Error ? error.message : error,
        )
      }

      const override = MANUAL_CARD_OVERRIDES[rawCard.id] ?? {}

      let stage = rawCard.stage
      if (rawCard.category === 'Pokemon' && !stage) {
        stage = await getPokemonStage(rawCard.name)
      }

      const { officialCount, pageId, ...baseCard } = rawCard

      return {
        ...baseCard,
        category: override.category ?? rawCard.category,
        hp: override.hp ?? rawCard.hp,
        stage: override.stage ?? stage,
        attacks:
          override.attacks ??
          (details.attacks.length > 0 ? details.attacks : rawCard.attacks),
        weaknesses: override.weaknesses ?? rawCard.weaknesses,
        retreat: override.retreat ?? rawCard.retreat,
        illustrator: details.illustrator ?? rawCard.illustrator,
      }
    },
  )
  const officialCardCount = parsedCards.reduce(
    (max, card) => Math.max(max, card.officialCount ?? 0),
    0,
  )

  return {
    set: {
      id: setCode,
      name: setName,
      releaseDate:
        MANUAL_SET_OVERRIDES[setCode]?.releaseDate ||
        parseSerebiiReleaseDate(html) ||
        releaseDateFallback,
      officialCardCount,
      totalCardCount: enrichedCards.length,
      source: 'serebii-fallback',
      sourceUrl: url,
    },
    cards: enrichedCards,
  }
}

async function fetchManualSerebiiSets(existingSetIds) {
  const payloads = await mapLimit(MANUAL_SEREBII_SETS, 2, async (setConfig) => {
    const payload = await fetchSerebiiSet(
      setConfig.id,
      setConfig.name,
      setConfig.releaseDate,
      setConfig.slug,
    )

    if (existingSetIds.has(setConfig.id)) {
      return {
        set: payload.set,
        cards: payload.cards,
      }
    }

    return payload
  })

  return {
    sets: payloads.map((payload) => payload.set).filter(Boolean),
    cards: payloads.flatMap((payload) => payload.cards),
  }
}

async function fetchSerebiiRepairsForBrokenSets(sets, cards) {
  const brokenSetIds = [...new Set(cards.filter(hasBrokenImage).map((card) => card.setId))]

  if (brokenSetIds.length === 0) {
    return { sets: [], cards: [] }
  }

  console.log(`Repairing broken images via Serebii for sets: ${brokenSetIds.join(', ')}`)

  const setConfigs = brokenSetIds
    .map((setId) => sets.find((set) => set.id === setId))
    .filter(Boolean)

  const payloads = await mapLimit(setConfigs, 2, async (setConfig) => {
    try {
      return await fetchSerebiiSet(setConfig.id, setConfig.name, setConfig.releaseDate)
    } catch (error) {
      console.warn(
        `Could not repair ${setConfig.id} from Serebii.`,
        error instanceof Error ? error.message : error,
      )
      return null
    }
  })

  return {
    sets: [],
    cards: payloads.filter(Boolean).flatMap((payload) => payload.cards),
  }
}

function mergeCards(primaryCards, fallbackCards) {
  const fallbackById = new Map(fallbackCards.map((card) => [card.id, card]))

  const mergedPrimary = primaryCards.map((card) => {
    const fallback = fallbackById.get(card.id)

    if (!fallback) {
      return card
    }

    return mergeCardData(card, fallback)
  })

  const existingIds = new Set(mergedPrimary.map((card) => card.id))
  const supplemental = fallbackCards.filter((card) => !existingIds.has(card.id))

  return [...mergedPrimary, ...supplemental]
}

function getLocalCardImagePath(cardId, imageUrl) {
  const extensionMatch = imageUrl?.match(/\.([a-z0-9]+)(?:$|\?)/i)
  const extension = extensionMatch?.[1]?.toLowerCase() ?? 'webp'
  return `/card-images/${cardId}.${extension}`
}

async function fetchGame8MissingSets(existingSetIds, tcgdexLastReleaseDate, tcgdexLastSetId) {
  console.log('Checking Game8 for newer set lists...')
  const dexHtml = await fetchText(GAME8_COMPLETE_DEX_URL)
  const game8Sets = parseGame8SetLinks(dexHtml)
  const missingSetLinks = game8Sets.filter((set) => !existingSetIds.has(set.code))

  if (missingSetLinks.length === 0) {
    return { sets: [], cards: [] }
  }

  console.log(
    `Found ${missingSetLinks.length} sets missing from TCGdex: ${missingSetLinks
      .map((set) => set.code)
      .join(', ')}`,
  )

  const supplementalPayloads = await mapLimit(missingSetLinks, 2, async (setLink) => {
    let game8Html

    try {
      game8Html = await fetchText(setLink.url)
    } catch (error) {
      console.warn(
        `Could not fetch Game8 set page for ${setLink.code}.`,
        error instanceof Error ? error.message : error,
      )
      return null
    }

    const setTitleMatch = game8Html.match(/<title>(.*?) Card List \((.*?)\)/i)
    if (!setTitleMatch) {
      return null
    }

    const releaseDate = parseGame8ReleaseDate(game8Html)
    if (compareSetCodes(setLink.code, tcgdexLastSetId) <= 0) {
      console.log(
        `Skipping ${setLink.code} because it is not newer than latest TCGdex set code ${tcgdexLastSetId}.`,
      )
      return null
    }
    if (releaseDate && new Date(releaseDate) <= new Date(tcgdexLastReleaseDate)) {
      console.log(
        `Skipping ${setLink.code} because its release date ${releaseDate} is not newer than TCGdex latest ${tcgdexLastReleaseDate}.`,
      )
      return null
    }

    const setName = setTitleMatch?.[1]?.trim() ?? setLink.name

    try {
      return await fetchSerebiiSet(setLink.code, setName, releaseDate)
    } catch (error) {
      console.warn(
        `Serebii fallback failed for ${setLink.code}, trying Game8 partial import.`,
        error instanceof Error ? error.message : error,
      )
    }

    const cards = parseGame8Cards(game8Html, setLink.code, setName)

    return {
      set: {
        id: setLink.code,
        name: setName,
        releaseDate,
        officialCardCount: cards.length,
        totalCardCount: cards.length,
        source: 'game8-fallback',
        sourceUrl: setLink.url,
      },
      cards,
    }
  })

  const resolvedPayloads = supplementalPayloads.filter(Boolean)

  return {
    sets: resolvedPayloads.map((payload) => payload.set),
    cards: resolvedPayloads.flatMap((payload) => payload.cards),
  }
}

async function main() {
  console.log('Fetching series metadata...')
  const series = await fetchJson(`${API_ROOT}/series/${SERIES_ID}`)

  console.log(`Found ${series.sets.length} sets. Fetching set payloads...`)
  const setPayloads = await mapLimit(series.sets, 4, async (setSummary) =>
    fetchJson(`${API_ROOT}/sets/${setSummary.id}`),
  )

  const allCardIds = setPayloads.flatMap((set) => set.cards.map((card) => card.id))
  console.log(`Fetching ${allCardIds.length} card payloads...`)

  const cardPayloads = await mapLimit(allCardIds, CONCURRENCY, async (cardId, index) => {
    if ((index + 1) % 100 === 0 || index === allCardIds.length - 1) {
      console.log(`Fetched ${index + 1}/${allCardIds.length} cards`)
    }

    return fetchJson(`${API_ROOT}/cards/${cardId}`)
  })

  const normalizedSets = setPayloads.map(normalizeSet)
  const normalizedCards = cardPayloads.map(normalizeCard)
  const brokenImageRepairs = await fetchSerebiiRepairsForBrokenSets(
    normalizedSets,
    normalizedCards,
  )
  const supplementalCatalog = await fetchGame8MissingSets(
    new Set(normalizedSets.map((set) => set.id)),
    normalizedSets
      .map((set) => set.releaseDate)
      .sort((left, right) => new Date(right) - new Date(left))[0],
    series.lastSet.id,
  )
  const manualPromoCatalog = await fetchManualSerebiiSets(
    new Set([...normalizedSets, ...supplementalCatalog.sets].map((set) => set.id)),
  )

  const allSets = uniqueBy(
    [...normalizedSets, ...manualPromoCatalog.sets, ...supplementalCatalog.sets],
    (set) => set.id,
  ).sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }))
  const allCards = mergeCards(
    mergeCards([...normalizedCards, ...supplementalCatalog.cards], brokenImageRepairs.cards),
    manualPromoCatalog.cards,
  ).sort((left, right) =>
    left.id.localeCompare(right.id, undefined, { numeric: true }),
  )

  const catalog = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: `${API_ROOT} + Serebii fallback + Game8 fallback`,
      seriesId: series.id,
      seriesName: series.name,
      setCount: allSets.length,
      cardCount: allCards.length,
    },
    sets: allSets,
    cards: allCards,
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  await writeFile(OUTPUT_FILE, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')

  console.log(`Catalog written to ${OUTPUT_FILE}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
