import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const reportDir = path.join(projectRoot, 'reports')
const reportJsonPath = path.join(reportDir, 'event-reward-links.json')
const reportMdPath = path.join(reportDir, 'event-reward-links.md')

const moduleCache = new Map()

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
      throw new Error(`Unsupported import in link audit loader: ${specifier}`)
    }

    let targetPath = path.resolve(path.dirname(resolvedPath), specifier)
    if (!path.extname(targetPath)) {
      if (existsSync(`${targetPath}.ts`)) {
        targetPath = `${targetPath}.ts`
      } else if (existsSync(path.join(targetPath, 'index.ts'))) {
        targetPath = path.join(targetPath, 'index.ts')
      }
    }

    const loaded = moduleCache.get(targetPath)
    if (loaded) {
      return loaded
    }

    throw new Error(`Synchronous require cache miss for ${specifier}`)
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

async function loadData() {
  await loadTsModule('src/data/rewards.ts')
  await loadTsModule('src/data/rewardOverrides.ts')
  await loadTsModule('src/data/generatedRewards.ts')
  await loadTsModule('src/data/events.ts')
  await loadTsModule('src/lib/rewards.ts')
  await loadTsModule('src/lib/events.ts')
  await loadTsModule('src/lib/rewardOrigins.ts')

  const { rewardGuides } = await loadTsModule('src/data/rewards.ts')
  const { rewardOverrides } = await loadTsModule('src/data/rewardOverrides.ts')
  const { generatedRewardGuides } = await loadTsModule('src/data/generatedRewards.ts')
  const { eventGuides } = await loadTsModule('src/data/events.ts')
  const { getRewardOriginDetails } = await loadTsModule('src/lib/rewardOrigins.ts')

  return { rewardGuides, rewardOverrides, generatedRewardGuides, eventGuides, getRewardOriginDetails }
}

function getAllRewards(rewardGuides, rewardOverrides, generatedRewardGuides) {
  const merged = new Map()

  generatedRewardGuides.forEach((reward) => {
    merged.set(`${reward.type}::${reward.name.toLowerCase()}`, reward)
  })
  rewardGuides.forEach((reward) => {
    merged.set(`${reward.type}::${reward.name.toLowerCase()}`, reward)
  })
  rewardOverrides.forEach((reward) => {
    merged.set(`${reward.type}::${reward.name.toLowerCase()}`, reward)
  })

  return [...merged.values()]
    .filter((reward) => reward.type === 'emblema')
    .sort((left, right) => left.name.localeCompare(right.name, 'it'))
}

function classifyRewardOrigin(reward, linkedEvents, getRewardOriginDetails) {
  if (linkedEvents.length > 0) {
    return 'evento'
  }

  const origin = getRewardOriginDetails(reward)
  if (origin.kind !== 'archivio') {
    return origin.kind
  }

  return 'non_classificata'
}

function toMdList(items, formatter) {
  return items.length ? items.map(formatter) : ['- Nessuna voce']
}

async function main() {
  await mkdir(reportDir, { recursive: true })
  const { rewardGuides, rewardOverrides, generatedRewardGuides, eventGuides, getRewardOriginDetails } =
    await loadData()
  const rewards = getAllRewards(rewardGuides, rewardOverrides, generatedRewardGuides)

  const linkedEventMap = new Map()
  for (const reward of rewards) {
    linkedEventMap.set(
      reward.slug,
      eventGuides.filter((event) => event.rewardSlugs.includes(reward.slug)),
    )
  }

  const eventsWithoutRewards = eventGuides.filter(
    (event) => !event.rewardSlugs.some((slug) => rewards.some((reward) => reward.slug === slug)) && event.promoCardIds.length === 0,
  )
  const eventsWithPromoCardsOnly = eventGuides.filter(
    (event) => !event.rewardSlugs.some((slug) => rewards.some((reward) => reward.slug === slug)) && event.promoCardIds.length > 0,
  )
  const rewardsWithoutEvents = rewards.filter((reward) => (linkedEventMap.get(reward.slug) ?? []).length === 0)
  const rewardsWithoutEventsButClassified = rewardsWithoutEvents.filter(
    (reward) => classifyRewardOrigin(reward, [], getRewardOriginDetails) !== 'non_classificata',
  )
  const rewardsWithoutAnyOrigin = rewardsWithoutEvents.filter(
    (reward) => classifyRewardOrigin(reward, [], getRewardOriginDetails) === 'non_classificata',
  )

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      eventCount: eventGuides.length,
      rewardCount: rewards.length,
      eventsWithoutRewardsCount: eventsWithoutRewards.length,
      eventsWithPromoCardsOnlyCount: eventsWithPromoCardsOnly.length,
      rewardsWithoutEventsCount: rewardsWithoutEvents.length,
      rewardsWithoutEventsButClassifiedCount: rewardsWithoutEventsButClassified.length,
      rewardsWithoutAnyOriginCount: rewardsWithoutAnyOrigin.length,
    },
    eventsWithoutRewards: eventsWithoutRewards.map((event) => ({
      slug: event.slug,
      name: event.name,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      linkedSetName: event.linkedSetName ?? null,
    })),
    eventsWithPromoCardsOnly: eventsWithPromoCardsOnly.map((event) => ({
      slug: event.slug,
      name: event.name,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      linkedSetName: event.linkedSetName ?? null,
      promoCardIds: event.promoCardIds,
    })),
    rewardsWithoutEventsButClassified: rewardsWithoutEventsButClassified.map((reward) => ({
      slug: reward.slug,
      name: reward.name,
      type: reward.type,
      method: classifyRewardOrigin(reward, [], getRewardOriginDetails),
      availability: reward.availability,
      sourceContext: reward.sourceContext,
    })),
    rewardsWithoutAnyOrigin: rewardsWithoutAnyOrigin.map((reward) => ({
      slug: reward.slug,
      name: reward.name,
      type: reward.type,
      availability: reward.availability,
      sourceContext: reward.sourceContext,
    })),
  }

  const lines = [
    '# Audit Collegamenti Eventi e Ricompense',
    '',
    `- Eventi controllati: ${report.summary.eventCount}`,
    `- Emblemi controllati: ${report.summary.rewardCount}`,
    `- Eventi senza emblemi collegati: ${report.summary.eventsWithoutRewardsCount}`,
    `- Eventi con sole carte promo collegate: ${report.summary.eventsWithPromoCardsOnlyCount}`,
    `- Emblemi senza eventi collegati: ${report.summary.rewardsWithoutEventsCount}`,
    `- Emblemi senza eventi ma con origine già classificata: ${report.summary.rewardsWithoutEventsButClassifiedCount}`,
    `- Emblemi senza eventi e ancora senza origine esplicita: ${report.summary.rewardsWithoutAnyOriginCount}`,
    '',
    '## Eventi Senza Emblemi Collegati',
    ...toMdList(report.eventsWithoutRewards, (event) => `- ${event.name} | ${event.startDate} - ${event.endDate}`),
    '',
    '## Emblemi Senza Eventi ma Già Classificati',
    ...toMdList(
      report.rewardsWithoutEventsButClassified,
      (reward) => `- ${reward.name} | ${reward.method} | ${reward.sourceContext}`,
    ),
    '',
    '## Eventi Con Sole Carte Promo',
    ...toMdList(
      report.eventsWithPromoCardsOnly,
      (event) => `- ${event.name} | ${event.startDate} - ${event.endDate} | promo: ${event.promoCardIds.join(', ')}`,
    ),
    '',
    '## Emblemi Senza Origine Esplicita',
    ...toMdList(
      report.rewardsWithoutAnyOrigin,
      (reward) => `- ${reward.name} | ${reward.type} | ${reward.sourceContext}`,
    ),
    '',
  ]

  await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await writeFile(reportMdPath, `${lines.join('\n')}\n`, 'utf8')

  console.log(JSON.stringify(report.summary, null, 2))
}

await main()
