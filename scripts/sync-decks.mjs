import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const reportsDir = path.join(projectRoot, 'reports')
const decksReportJsonPath = path.join(reportsDir, 'decks-sync.json')
const decksReportMdPath = path.join(reportsDir, 'decks-sync.md')
const moduleCache = new Map()

function resolveModulePath(fromPath, specifier) {
  let targetPath = path.resolve(path.dirname(fromPath), specifier)

  if (!path.extname(targetPath)) {
    if (existsSync(`${targetPath}.ts`)) {
      targetPath = `${targetPath}.ts`
    } else if (existsSync(path.join(targetPath, 'index.ts'))) {
      targetPath = path.join(targetPath, 'index.ts')
    }
  }

  return targetPath
}

function loadTsModuleSync(resolvedPath) {
  if (moduleCache.has(resolvedPath)) {
    return moduleCache.get(resolvedPath)
  }

  const source = readFileSync(resolvedPath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: resolvedPath,
  }).outputText

  const exports = {}
  const module = { exports }

  const localRequire = (specifier) => {
    if (!specifier.startsWith('.')) {
      throw new Error(`Unsupported import in deck sync loader: ${specifier}`)
    }

    const targetPath = resolveModulePath(resolvedPath, specifier)
    return loadTsModuleSync(targetPath)
  }

  moduleCache.set(resolvedPath, exports)

  const script = new vm.Script(transpiled, { filename: resolvedPath })
  const context = vm.createContext({
    module,
    exports,
    require: localRequire,
    __dirname: path.dirname(resolvedPath),
    __filename: resolvedPath,
    process,
    console,
  })
  script.runInContext(context)

  moduleCache.set(resolvedPath, module.exports)
  return module.exports
}

function loadTsModule(modulePath) {
  return loadTsModuleSync(path.resolve(projectRoot, modulePath))
}

function assertTwentyCards(deck) {
  const total = deck.cards.reduce((sum, card) => sum + card.count, 0)

  if (total !== 20) {
    throw new Error(`Il mazzo ${deck.slug} contiene ${total} carte invece di 20.`)
  }
}

function assertUniqueSlugs(decks, label) {
  const seen = new Set()

  for (const deck of decks) {
    if (seen.has(deck.slug)) {
      throw new Error(`Slug duplicato in ${label}: ${deck.slug}`)
    }

    seen.add(deck.slug)
  }
}

function assertReferenceDecks(metaDecks, allDeckIdeas) {
  const allDeckSlugs = new Set(allDeckIdeas.map((deck) => deck.slug))

  for (const metaDeck of metaDecks) {
    if (!allDeckSlugs.has(metaDeck.referenceDeckSlug)) {
      throw new Error(
        `Il meta deck ${metaDeck.slug} punta a una guida mancante: ${metaDeck.referenceDeckSlug}.`,
      )
    }
  }
}

function buildDeckSyncReport({ deckIdeas, allDeckIdeas, experimentalDecks, metaDecks, missionDecks, metaDeckSnapshot }) {
  const timestamp = new Date().toISOString()

  return {
    generatedAt: timestamp,
    metaSnapshot: metaDeckSnapshot,
    counts: {
      editorial: deckIdeas.length,
      indexed: allDeckIdeas.length,
      competitive: metaDecks.length,
      mission: missionDecks.length,
      experimental: experimentalDecks.length,
    },
    competitiveTop: metaDecks.slice(0, 8).map((deck) => ({
      rank: deck.rank,
      archetype: deck.archetype,
      winRate: deck.winRate,
      share: deck.share,
      referenceDeckSlug: deck.referenceDeckSlug,
    })),
    suggestedGuides: deckIdeas.slice(0, 8).map((deck) => ({
      slug: deck.slug,
      name: deck.name,
      tier: deck.tier,
      updatedAt: deck.updatedAt,
    })),
    experimentalHighlights: experimentalDecks.map((deck) => ({
      slug: deck.slug,
      name: deck.name,
      updatedAt: deck.updatedAt,
    })),
  }
}

function buildDeckSyncMarkdown(report) {
  const lines = [
    '# Report sincronizzazione mazzi',
    '',
    `Generato il: ${report.generatedAt}`,
    '',
    '## Totali',
    `- Guide editoriali: ${report.counts.editorial}`,
    `- Guide indicizzate: ${report.counts.indexed}`,
    `- Meta competitivo: ${report.counts.competitive}`,
    `- Missioni / CPU: ${report.counts.mission}`,
    `- Sperimentali: ${report.counts.experimental}`,
    '',
    '## Snapshot meta',
    `- Aggiornato al: ${report.metaSnapshot.generatedAtLabel}`,
    `- Fonte: ${report.metaSnapshot.sourceLabel}`,
    `- URL: ${report.metaSnapshot.sourceUrl}`,
    `- Tornei: ${report.metaSnapshot.tournaments}`,
    `- Match: ${report.metaSnapshot.matches}`,
    '',
    '## Top competitivo',
    ...report.competitiveTop.map(
      (deck) =>
        `- #${deck.rank} ${deck.archetype} | winrate ${deck.winRate.toFixed(2)}% | presenza ${deck.share.toFixed(2)}% | guida ${deck.referenceDeckSlug}`,
    ),
    '',
    '## Guide suggerite',
    ...report.suggestedGuides.map(
      (deck) => `- ${deck.name} (${deck.slug}) | tier ${deck.tier} | aggiornato ${deck.updatedAt}`,
    ),
    '',
    '## Sperimentali',
    ...report.experimentalHighlights.map(
      (deck) => `- ${deck.name} (${deck.slug}) | aggiornato ${deck.updatedAt}`,
    ),
    '',
  ]

  return lines.join('\n')
}

async function main() {
  const { allDeckIdeas, deckIdeas, experimentalDecks } = loadTsModule('src/data/decks.ts')
  const { metaDecks, metaDeckSnapshot } = loadTsModule('src/data/metaDecks.ts')
  const { missionDecks } = loadTsModule('src/data/missionDecks.ts')

  assertUniqueSlugs(allDeckIdeas, 'allDeckIdeas')
  assertUniqueSlugs(metaDecks, 'metaDecks')
  assertUniqueSlugs(missionDecks, 'missionDecks')
  assertReferenceDecks(metaDecks, allDeckIdeas)

  for (const deck of allDeckIdeas) {
    assertTwentyCards(deck)
  }

  const report = buildDeckSyncReport({
    deckIdeas,
    allDeckIdeas,
    experimentalDecks,
    metaDecks,
    missionDecks,
    metaDeckSnapshot,
  })

  await mkdir(reportsDir, { recursive: true })
  await writeFile(decksReportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await writeFile(decksReportMdPath, `${buildDeckSyncMarkdown(report)}\n`, 'utf8')

  console.log('Mazzi sincronizzati:')
  console.log(`- Guide editoriali: ${deckIdeas.length}`)
  console.log(`- Guide totali indicizzate: ${allDeckIdeas.length}`)
  console.log(`- Meta competitivo: ${metaDecks.length}`)
  console.log(`- Missioni / CPU: ${missionDecks.length}`)
  console.log(`- Sperimentali: ${experimentalDecks.length}`)
  console.log(`- Report JSON aggiornato: ${path.relative(projectRoot, decksReportJsonPath)}`)
  console.log(`- Report Markdown aggiornato: ${path.relative(projectRoot, decksReportMdPath)}`)
}

try {
  await main()
} catch (error) {
  console.error('ERRORE: aggiornamento mazzi non riuscito.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
