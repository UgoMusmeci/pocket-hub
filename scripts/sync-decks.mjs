import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
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

function main() {
  const { allDeckIdeas, deckIdeas, experimentalDecks } = loadTsModule('src/data/decks.ts')
  const { metaDecks } = loadTsModule('src/data/metaDecks.ts')
  const { missionDecks } = loadTsModule('src/data/missionDecks.ts')

  assertUniqueSlugs(allDeckIdeas, 'allDeckIdeas')
  assertUniqueSlugs(metaDecks, 'metaDecks')
  assertUniqueSlugs(missionDecks, 'missionDecks')

  for (const deck of allDeckIdeas) {
    assertTwentyCards(deck)
  }

  console.log('Mazzi sincronizzati:')
  console.log(`- Guide editoriali: ${deckIdeas.length}`)
  console.log(`- Guide totali indicizzate: ${allDeckIdeas.length}`)
  console.log(`- Meta competitivo: ${metaDecks.length}`)
  console.log(`- Missioni / CPU: ${missionDecks.length}`)
  console.log(`- Sperimentali: ${experimentalDecks.length}`)
}

try {
  main()
} catch (error) {
  console.error('ERRORE: aggiornamento mazzi non riuscito.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
