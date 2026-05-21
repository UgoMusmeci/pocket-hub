import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const reportDir = path.join(projectRoot, 'reports')
const reportJsonPath = path.join(reportDir, 'content-audit.json')
const reportMdPath = path.join(reportDir, 'content-audit.md')
const publicDir = path.join(projectRoot, 'public')

const remoteCheckEnabled = process.argv.includes('--remote')
const urlStatusCache = new Map()
const moduleCache = new Map()

const timeoutSignal = (ms) => AbortSignal.timeout(ms)

async function ensureReportDir() {
  await mkdir(reportDir, { recursive: true })
}

async function loadTsModule(modulePath) {
  const resolvedPath = path.resolve(projectRoot, modulePath)
  if (moduleCache.has(resolvedPath)) {
    return moduleCache.get(resolvedPath)
  }

  const source = await readFile(resolvedPath, 'utf8')
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
      throw new Error(`Unsupported import in audit loader: ${specifier}`)
    }

    let targetPath = path.resolve(path.dirname(resolvedPath), specifier)
    if (!path.extname(targetPath)) {
      if (existsSync(`${targetPath}.ts`)) {
        targetPath = `${targetPath}.ts`
      } else if (existsSync(path.join(targetPath, 'index.ts'))) {
        targetPath = path.join(targetPath, 'index.ts')
      }
    }

    const projectRelative = path.relative(projectRoot, targetPath)
    const loaded = moduleCache.get(targetPath)
    if (loaded) {
      return loaded
    }

    throw new Error(
      `Synchronous require cache miss for ${specifier}. Load order issue while resolving ${projectRelative}`,
    )
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

async function preloadAuditModules() {
  await loadTsModule('src/data/deckTypes.ts')
  await loadTsModule('src/data/deckSet1.ts')
  await loadTsModule('src/data/deckSet2.ts')
  await loadTsModule('src/data/deckSet3.ts')
  await loadTsModule('src/data/deckSet4.ts')
  await loadTsModule('src/data/deckSet5.ts')
  await loadTsModule('src/data/decks.ts')
  await loadTsModule('src/data/metaDecks.ts')
  await loadTsModule('src/data/missionDecks.ts')
  await loadTsModule('src/data/rewards.ts')
  await loadTsModule('src/data/rewardOverrides.ts')
  await loadTsModule('src/data/generatedRewards.ts')
  await loadTsModule('src/data/events.ts')
}

function normalizeLookupName(value) {
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

function getCardImageUrl(card) {
  if (!card.image || card.image.startsWith('undefined/')) {
    return null
  }

  if (card.source === 'serebii-fallback') {
    return card.image.replace('/tcgpocket/th/', '/tcgpocket/')
  }

  return card.image
}

async function checkUrl(url) {
  if (!url) {
    return { ok: false, status: 'missing' }
  }

  if (urlStatusCache.has(url)) {
    return urlStatusCache.get(url)
  }

  const promise = (async () => {
    if (url.startsWith('/')) {
      const localPath = path.join(publicDir, url.replace(/^\//, '').replaceAll('/', path.sep))
      return existsSync(localPath)
        ? { ok: true, status: 200 }
        : { ok: false, status: 'missing-local' }
    }

    if (!remoteCheckEnabled) {
      return { ok: true, status: 'skipped-remote' }
    }

    try {
      let response = await fetch(url, {
        method: 'HEAD',
        signal: timeoutSignal(10000),
        redirect: 'follow',
      })

      if (!response.ok || response.status === 405) {
        response = await fetch(url, {
          method: 'GET',
          signal: timeoutSignal(10000),
          redirect: 'follow',
        })
      }

      return { ok: response.ok, status: response.status }
    } catch (error) {
      return {
        ok: false,
        status: error instanceof Error ? error.message : 'request-error',
      }
    }
  })()

  urlStatusCache.set(url, promise)
  return promise
}

function createIssue(section, kind, identifier, details) {
  return {
    section,
    kind,
    identifier,
    ...details,
  }
}

async function auditCards(catalog) {
  const issues = []

  for (const card of catalog.cards) {
    const imageUrl = getCardImageUrl(card)
    const imageCheck = await checkUrl(imageUrl)

    if (!imageUrl) {
      issues.push(
        createIssue('cards', 'missing-image', card.id, {
          cardId: card.id,
          name: card.name,
          setId: card.setId,
          setName: card.setName,
          localId: card.localId,
        }),
      )
    } else if (!imageCheck.ok) {
      issues.push(
        createIssue('cards', 'broken-image', card.id, {
          cardId: card.id,
          name: card.name,
          setId: card.setId,
          setName: card.setName,
          localId: card.localId,
          imageUrl,
          status: imageCheck.status,
        }),
      )
    }

    const missingFields = []
    if (!card.name) missingFields.push('name')
    if (!card.localId) missingFields.push('localId')
    if (!card.setName) missingFields.push('setName')
    if (!card.category) missingFields.push('category')

    if (card.category === 'Trainer') {
      issues.push(
        createIssue('cards', 'invalid-category', card.id, {
          cardId: card.id,
          name: card.name,
          setId: card.setId,
          setName: card.setName,
          localId: card.localId,
          category: card.category,
        }),
      )
    }

    if (card.category === 'Pokemon') {
      if (!card.hp) missingFields.push('hp')
      if (!card.stage) missingFields.push('stage')
      if (!card.types?.length) missingFields.push('types')
      if (!card.attacks?.length) missingFields.push('attacks')
    }

    if (missingFields.length > 0) {
      issues.push(
        createIssue('cards', 'incomplete-info', card.id, {
          cardId: card.id,
          name: card.name,
          setId: card.setId,
          setName: card.setName,
          localId: card.localId,
          missingFields,
        }),
      )
    }
  }

  return {
    total: catalog.cards.length,
    issues,
  }
}

function findCatalogCard(cards, entryName) {
  const exact = cards.find((card) => card.name === entryName)
  if (exact) {
    return exact
  }

  const normalizedEntry = normalizeLookupName(entryName)
  return cards.find((card) => normalizeLookupName(card.name) === normalizedEntry)
}

async function auditDecks(catalog, allDeckIdeas, metaDecks, missionDecks) {
  const issues = []
  const deckSlugSet = new Set(allDeckIdeas.map((deck) => deck.slug))

  for (const deck of allDeckIdeas) {
    const missingFields = []
    if (!deck.name) missingFields.push('name')
    if (!deck.description) missingFields.push('description')
    if (!deck.strategy) missingFields.push('strategy')
    if (!deck.updatedAt) missingFields.push('updatedAt')
    if (!deck.strengths?.length) missingFields.push('strengths')
    if (!deck.weaknesses?.length) missingFields.push('weaknesses')
    if (!deck.representativeCard) missingFields.push('representativeCard')

    if (missingFields.length > 0) {
      issues.push(
        createIssue('decks', 'incomplete-guide', deck.slug, {
          deckName: deck.name,
          missingFields,
        }),
      )
    }

    const totalCards = deck.cards.reduce((sum, entry) => sum + entry.count, 0)
    if (totalCards !== 20) {
      issues.push(
        createIssue('decks', 'invalid-card-total', deck.slug, {
          deckName: deck.name,
          expected: 20,
          actual: totalCards,
        }),
      )
    }

    const representativeCheck = await checkUrl(deck.representativePokemon?.sprite)
    if (!deck.representativePokemon?.sprite || !representativeCheck.ok) {
      issues.push(
        createIssue('decks', 'missing-representative-sprite', deck.slug, {
          deckName: deck.name,
          pokemonName: deck.representativePokemon?.name ?? '',
          sprite: deck.representativePokemon?.sprite ?? null,
          status: representativeCheck.status,
        }),
      )
    }

    for (const entry of deck.cards) {
      const resolved = findCatalogCard(catalog.cards, entry.name)
      if (!resolved) {
        issues.push(
          createIssue('decks', 'unresolved-card', `${deck.slug}::${entry.name}`, {
            deckName: deck.name,
            cardName: entry.name,
            count: entry.count,
          }),
        )
      }
    }
  }

  for (const metaDeck of metaDecks) {
    const missingFields = []
    if (!metaDeck.archetype) missingFields.push('archetype')
    if (typeof metaDeck.deckCount !== 'number') missingFields.push('deckCount')
    if (typeof metaDeck.share !== 'number') missingFields.push('share')
    if (typeof metaDeck.winRate !== 'number') missingFields.push('winRate')
    if (!metaDeck.referenceDeckSlug) missingFields.push('referenceDeckSlug')

    if (missingFields.length > 0) {
      issues.push(
        createIssue('decks', 'meta-incomplete-info', metaDeck.slug, {
          deckName: metaDeck.archetype,
          missingFields,
        }),
      )
    }

    if (!deckSlugSet.has(metaDeck.referenceDeckSlug)) {
      issues.push(
        createIssue('decks', 'meta-reference-missing', metaDeck.slug, {
          deckName: metaDeck.archetype,
          referenceDeckSlug: metaDeck.referenceDeckSlug,
        }),
      )
    }

    const representativeCheck = await checkUrl(metaDeck.representativePokemon?.sprite)
    if (!metaDeck.representativePokemon?.sprite || !representativeCheck.ok) {
      issues.push(
        createIssue('decks', 'meta-missing-representative-sprite', metaDeck.slug, {
          deckName: metaDeck.archetype,
          pokemonName: metaDeck.representativePokemon?.name ?? '',
          sprite: metaDeck.representativePokemon?.sprite ?? null,
          status: representativeCheck.status,
        }),
      )
    }

  }

  for (const missionDeck of missionDecks) {
    const missingFields = []
    if (!missionDeck.name) missingFields.push('name')
    if (!missionDeck.goal) missingFields.push('goal')
    if (!missionDeck.description) missingFields.push('description')
    if (!missionDeck.strengths?.length) missingFields.push('strengths')

    if (missingFields.length > 0) {
      issues.push(
        createIssue('decks', 'mission-incomplete-info', missionDeck.slug, {
          deckName: missionDeck.name,
          missingFields,
        }),
      )
    }

    if (missionDeck.relatedGuideSlug && !deckSlugSet.has(missionDeck.relatedGuideSlug)) {
      issues.push(
        createIssue('decks', 'mission-reference-missing', missionDeck.slug, {
          deckName: missionDeck.name,
          referenceDeckSlug: missionDeck.relatedGuideSlug,
        }),
      )
    }

    const representativeCheck = await checkUrl(missionDeck.representativePokemon?.sprite)
    if (!missionDeck.representativePokemon?.sprite || !representativeCheck.ok) {
      issues.push(
        createIssue('decks', 'mission-missing-representative-sprite', missionDeck.slug, {
          deckName: missionDeck.name,
          pokemonName: missionDeck.representativePokemon?.name ?? '',
          sprite: missionDeck.representativePokemon?.sprite ?? null,
          status: representativeCheck.status,
        }),
      )
    }

  }

  return {
    totalDeckIdeas: allDeckIdeas.length,
    totalMetaDecks: metaDecks.length,
    totalMissionDecks: missionDecks.length,
    issues,
  }
}

async function auditRewards(manualRewards, overrideRewards, generatedRewards, eventGuides) {
  const issues = []
  const merged = new Map()

  for (const reward of generatedRewards) {
    merged.set(`${reward.type}::${reward.name.toLowerCase()}`, reward)
  }

  for (const reward of manualRewards) {
    merged.set(`${reward.type}::${reward.name.toLowerCase()}`, reward)
  }

  for (const reward of overrideRewards) {
    merged.set(`${reward.type}::${reward.name.toLowerCase()}`, reward)
  }

  const rewards = [...merged.values()].filter((reward) => reward.type === 'emblema')
  const badgeChecks = new Map()
  const badgeByType = {
    emblema: '/reward-types/emblema.svg',
  }

  for (const reward of rewards) {
    const imageCheck = await checkUrl(reward.imageUrl)
    if (!reward.imageUrl || !imageCheck.ok) {
      const fallbackCheck = await checkUrl(reward.sourceImageUrl)
      issues.push(
        createIssue('rewards', 'missing-local-image', reward.slug, {
          rewardName: reward.name,
          type: reward.type,
          imageUrl: reward.imageUrl,
          sourceImageUrl: reward.sourceImageUrl,
          localStatus: imageCheck.status,
          sourceStatus: fallbackCheck.status,
        }),
      )
    }

    const missingFields = []
    if (!reward.name) missingFields.push('name')
    if (!reward.requirement) missingFields.push('requirement')
    if (!reward.description) missingFields.push('description')
    if (!reward.sourceUrl) missingFields.push('sourceUrl')
    if (!reward.sourceLabel) missingFields.push('sourceLabel')

    if (missingFields.length > 0) {
      issues.push(
        createIssue('rewards', 'incomplete-info', reward.slug, {
          rewardName: reward.name,
          type: reward.type,
          missingFields,
        }),
      )
    }

    if (
      reward.type === 'emblema' &&
      (reward.method === 'archivio_gioco' ||
        reward.availability === 'catalogata' ||
        (typeof reward.requirement === 'string' && reward.requirement.includes('Metodo preciso')))
    ) {
      issues.push(
        createIssue('rewards', 'generic-emblem-info', reward.slug, {
          rewardName: reward.name,
          type: reward.type,
        }),
      )
    }

    if (
      reward.type === 'emblema' &&
      reward.method === 'evento' &&
      !eventGuides.some((event) => event.rewardSlugs.includes(reward.slug))
    ) {
      issues.push(
        createIssue('rewards', 'missing-event-link', reward.slug, {
          rewardName: reward.name,
          type: reward.type,
          sourceContext: reward.sourceContext,
        }),
      )
    }

    if (!badgeChecks.has(reward.type)) {
      badgeChecks.set(reward.type, await checkUrl(badgeByType[reward.type]))
    }

    const badgeCheck = badgeChecks.get(reward.type)
    if (!badgeCheck.ok) {
      issues.push(
        createIssue('rewards', 'missing-type-badge', reward.type, {
          rewardName: reward.name,
          type: reward.type,
          badge: badgeByType[reward.type],
          status: badgeCheck.status,
        }),
      )
    }
  }

  return {
    total: rewards.length,
    issues,
  }
}

async function auditEvents(eventGuides, rewardGuides, overrideRewards, generatedRewards, catalog) {
  const issues = []
  const rewardMap = new Map()

  for (const reward of generatedRewards) {
    rewardMap.set(reward.slug, reward)
  }

  for (const reward of rewardGuides) {
    rewardMap.set(reward.slug, reward)
  }

  for (const reward of overrideRewards) {
    rewardMap.set(reward.slug, reward)
  }

  for (const event of eventGuides) {
    const missingFields = []
    if (!event.name) missingFields.push('name')
    if (!event.summary) missingFields.push('summary')
    if (!event.description) missingFields.push('description')
    if (!event.startDate) missingFields.push('startDate')
    if (!event.endDate) missingFields.push('endDate')
    if (!event.sourceUrl) missingFields.push('sourceUrl')
    if (!event.sourceLabel) missingFields.push('sourceLabel')
    if (!event.imageUrl) missingFields.push('imageUrl')
    if (!event.imageAlt) missingFields.push('imageAlt')

    if (missingFields.length > 0) {
      issues.push(
        createIssue('events', 'incomplete-info', event.slug, {
          eventName: event.name,
          missingFields,
        }),
      )
    }

    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      issues.push(
        createIssue('events', 'invalid-dates', event.slug, {
          eventName: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
        }),
      )
    }

    if ((!event.rewardSlugs || event.rewardSlugs.length === 0) && (!event.consumableRewards || event.consumableRewards.length === 0)) {
      issues.push(
        createIssue('events', 'empty-rewards', event.slug, {
          eventName: event.name,
        }),
      )
    }

    const eventImageCheck = await checkUrl(event.imageUrl)
    if (!eventImageCheck.ok) {
      issues.push(
        createIssue('events', 'missing-event-image', event.slug, {
          eventName: event.name,
          imageUrl: event.imageUrl,
          status: eventImageCheck.status,
        }),
      )
    }

    for (const rewardSlug of event.rewardSlugs ?? []) {
      if (!rewardMap.has(rewardSlug)) {
        issues.push(
          createIssue('events', 'missing-linked-reward', `${event.slug}::${rewardSlug}`, {
            eventName: event.name,
            rewardSlug,
          }),
        )
      }
    }

    for (const promoCardId of event.promoCardIds ?? []) {
      const promoCard = catalog.cards.find((card) => card.id === promoCardId)
      if (!promoCard) {
        issues.push(
          createIssue('events', 'missing-linked-promo-card', `${event.slug}::${promoCardId}`, {
            eventName: event.name,
            promoCardId,
          }),
        )
      }
    }
  }

  return {
    total: eventGuides.length,
    issues,
  }
}

function cardIssueToLine(issue) {
  const label = `${issue.name || 'Carta senza nome'} | ${issue.setName || issue.setId} | #${issue.localId || issue.cardId}`
  if (issue.kind === 'incomplete-info') {
    return `- ${label} | campi mancanti: ${issue.missingFields.join(', ')}`
  }

  if (issue.kind === 'invalid-category') {
    return `- ${label} | categoria non valida: ${issue.category}`
  }

  return `- ${label} | immagine: ${issue.status ?? 'mancante'}`
}

function deckIssueToLine(issue) {
  const name = issue.deckName || issue.identifier
  switch (issue.kind) {
    case 'invalid-card-total':
      return `- ${name} | totale carte ${issue.actual}/${issue.expected}`
    case 'unresolved-card':
      return `- ${name} | carta non trovata nel catalogo: ${issue.cardName}`
    case 'incomplete-guide':
    case 'meta-incomplete-info':
    case 'mission-incomplete-info':
      return `- ${name} | campi mancanti: ${issue.missingFields.join(', ')}`
    default:
      return `- ${name} | ${issue.kind}`
  }
}

function rewardIssueToLine(issue) {
  const name = issue.rewardName || issue.identifier
  if (issue.kind === 'incomplete-info') {
    return `- ${name} | campi mancanti: ${issue.missingFields.join(', ')}`
  }

  if (issue.kind === 'missing-local-image') {
    return `- ${name} | immagine locale: ${issue.localStatus} | sorgente: ${issue.sourceStatus}`
  }

  if (issue.kind === 'generic-emblem-info') {
    return `- ${name} | metodo di ottenimento ancora generico`
  }

  if (issue.kind === 'missing-event-link') {
    return `- ${name} | emblema evento senza collegamento bidirezionale a un evento`
  }

  return `- ${name} | ${issue.kind}`
}

function eventIssueToLine(issue) {
  const name = issue.eventName || issue.identifier
  switch (issue.kind) {
    case 'incomplete-info':
      return `- ${name} | campi mancanti: ${issue.missingFields.join(', ')}`
    case 'invalid-dates':
      return `- ${name} | date non valide: ${issue.startDate} - ${issue.endDate}`
    case 'missing-linked-reward':
      return `- ${name} | ricompensa collegata non trovata: ${issue.rewardSlug}`
    case 'empty-rewards':
      return `- ${name} | nessuna ricompensa o consumabile associato`
    case 'missing-event-image':
      return `- ${name} | immagine evento non disponibile: ${issue.status}`
    case 'missing-linked-promo-card':
      return `- ${name} | carta promo collegata non trovata: ${issue.promoCardId}`
    default:
      return `- ${name} | ${issue.kind}`
  }
}

function buildMarkdownReport(report) {
  const cardIssues = report.cards.issues
  const deckIssues = report.decks.issues
  const rewardIssues = report.rewards.issues
  const eventIssues = report.events.issues

  return [
    '# Audit contenuti',
    '',
    `Generato: ${report.generatedAt}`,
    `Controllo remoto immagini: ${report.remoteCheckEnabled ? 'attivo' : 'disattivato'}`,
    '',
    '## Riepilogo',
    '',
    `- Carte controllate: ${report.cards.total}`,
    `- Problemi carte: ${cardIssues.length}`,
    `- Mazzi controllati: ${report.decks.totalDeckIdeas + report.decks.totalMetaDecks + report.decks.totalMissionDecks}`,
    `- Problemi mazzi: ${deckIssues.length}`,
    `- Ricompense controllate: ${report.rewards.total}`,
    `- Problemi ricompense: ${rewardIssues.length}`,
    `- Eventi controllati: ${report.events.total}`,
    `- Problemi eventi: ${eventIssues.length}`,
    '',
    '## Carte con problemi',
    '',
    ...(cardIssues.length ? cardIssues.map(cardIssueToLine) : ['- Nessun problema rilevato']),
    '',
    '## Mazzi con problemi',
    '',
    ...(deckIssues.length ? deckIssues.map(deckIssueToLine) : ['- Nessun problema rilevato']),
    '',
    '## Ricompense con problemi',
    '',
    ...(rewardIssues.length ? rewardIssues.map(rewardIssueToLine) : ['- Nessun problema rilevato']),
    '',
    '## Eventi con problemi',
    '',
    ...(eventIssues.length ? eventIssues.map(eventIssueToLine) : ['- Nessun problema rilevato']),
    '',
  ].join('\n')
}

async function main() {
  await ensureReportDir()
  await preloadAuditModules()

  const catalog = JSON.parse(
    await readFile(path.join(projectRoot, 'public', 'data', 'catalog.json'), 'utf8'),
  )
  const { allDeckIdeas } = await loadTsModule('src/data/decks.ts')
  const { metaDecks } = await loadTsModule('src/data/metaDecks.ts')
  const { missionDecks } = await loadTsModule('src/data/missionDecks.ts')
  const { rewardGuides } = await loadTsModule('src/data/rewards.ts')
  const { rewardOverrides } = await loadTsModule('src/data/rewardOverrides.ts')
  const { generatedRewardGuides } = await loadTsModule('src/data/generatedRewards.ts')
  const { eventGuides } = await loadTsModule('src/data/events.ts')

  const report = {
    generatedAt: new Date().toISOString(),
    remoteCheckEnabled,
    cards: await auditCards(catalog),
    decks: await auditDecks(catalog, allDeckIdeas, metaDecks, missionDecks),
    rewards: await auditRewards(rewardGuides, rewardOverrides, generatedRewardGuides, eventGuides),
    events: await auditEvents(
      eventGuides,
      rewardGuides,
      rewardOverrides,
      generatedRewardGuides,
      catalog,
    ),
  }

  await writeFile(reportJsonPath, JSON.stringify(report, null, 2))
  await writeFile(reportMdPath, buildMarkdownReport(report))

  console.log(
    JSON.stringify(
      {
        reportJsonPath: pathToFileURL(reportJsonPath).href,
        reportMdPath: pathToFileURL(reportMdPath).href,
        summary: {
          cardIssues: report.cards.issues.length,
          deckIssues: report.decks.issues.length,
          rewardIssues: report.rewards.issues.length,
          eventIssues: report.events.issues.length,
        },
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
