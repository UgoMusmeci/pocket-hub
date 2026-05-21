import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const publicDir = path.join(projectRoot, 'public')
const catalogPath = path.join(publicDir, 'data', 'catalog.json')
const cardOutputDir = path.join(publicDir, 'card-images')
const spriteOutputDir = path.join(publicDir, 'pokemon-artwork')
const spriteRemoteBase =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
const concurrency = 16

function ensureUrl(url) {
  if (!url || url.startsWith('undefined/')) {
    return null
  }

  return url
}

function getRemoteCardImageUrl(card) {
  const sourceUrl = ensureUrl(card.image)
  if (!sourceUrl) {
    return null
  }

  if (card.source === 'serebii-fallback') {
    return sourceUrl.replace('/tcgpocket/th/', '/tcgpocket/')
  }

  return sourceUrl
}

function toAbsoluteOutput(localPath) {
  return path.join(publicDir, localPath.replace(/^\//, '').replaceAll('/', path.sep))
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; PokemonPocketCatalogBot/1.0; +https://example.com)',
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0

  async function runWorker() {
    while (cursor < items.length) {
      const currentIndex = cursor
      cursor += 1
      results[currentIndex] = await worker(items[currentIndex], currentIndex)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runWorker()),
  )

  return results
}

async function syncCardImages(catalog) {
  await mkdir(cardOutputDir, { recursive: true })

  const jobs = catalog.cards
    .map((card) => ({
      cardId: card.id,
      remoteUrl: getRemoteCardImageUrl(card),
      outputPath: card.localImage ? toAbsoluteOutput(card.localImage) : null,
    }))
    .filter((job) => job.remoteUrl && job.outputPath)

  let downloaded = 0
  let skipped = 0
  let failed = 0

  await mapLimit(jobs, concurrency, async (job, index) => {
    if (existsSync(job.outputPath)) {
      skipped += 1
      return
    }

    try {
      const data = await fetchBuffer(job.remoteUrl)
      await mkdir(path.dirname(job.outputPath), { recursive: true })
      await writeFile(job.outputPath, data)
      downloaded += 1
    } catch (error) {
      failed += 1
      console.warn(
        `Skipped card image ${job.cardId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }

    if ((index + 1) % 200 === 0 || index === jobs.length - 1) {
      console.log(`Card assets processed ${index + 1}/${jobs.length}`)
    }
  })

  return { total: jobs.length, downloaded, skipped, failed }
}

async function collectArtworkDexIds() {
  const sourceFiles = [
    'src/data/deckTypes.ts',
    'src/data/deckSet1.ts',
    'src/data/deckSet2.ts',
    'src/data/deckSet3.ts',
    'src/data/deckSet4.ts',
    'src/data/deckSet5.ts',
    'src/data/metaDecks.ts',
    'src/data/missionDecks.ts',
  ]

  const dexIds = new Set()

  for (const relativeFile of sourceFiles) {
    const content = await readFile(path.join(projectRoot, relativeFile), 'utf8')
    for (const match of content.matchAll(/artwork\((\d+)\)/g)) {
      dexIds.add(match[1])
    }
  }

  return [...dexIds].sort((left, right) => Number(left) - Number(right))
}

async function syncPokemonArtwork() {
  await mkdir(spriteOutputDir, { recursive: true })
  const dexIds = await collectArtworkDexIds()

  let downloaded = 0
  let skipped = 0
  let failed = 0

  await mapLimit(dexIds, concurrency, async (dexId, index) => {
    const outputPath = path.join(spriteOutputDir, `${dexId}.png`)
    if (existsSync(outputPath)) {
      skipped += 1
      return
    }

    const remoteUrl = `${spriteRemoteBase}/${dexId}.png`

    try {
      const data = await fetchBuffer(remoteUrl)
      await writeFile(outputPath, data)
      downloaded += 1
    } catch (error) {
      failed += 1
      console.warn(
        `Skipped pokemon artwork ${dexId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }

    if ((index + 1) % 20 === 0 || index === dexIds.length - 1) {
      console.log(`Pokemon artwork processed ${index + 1}/${dexIds.length}`)
    }
  })

  return { total: dexIds.length, downloaded, skipped, failed }
}

async function main() {
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))

  const [cardResult, spriteResult] = await Promise.all([
    syncCardImages(catalog),
    syncPokemonArtwork(),
  ])

  console.log(
    JSON.stringify(
      {
        cards: cardResult,
        pokemonArtwork: spriteResult,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
