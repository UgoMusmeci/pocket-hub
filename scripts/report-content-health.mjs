import { readFile } from 'node:fs/promises'
import path from 'node:path'

const catalogPath = path.resolve('public', 'data', 'catalog.json')
const expectedLatestSets = [
  { id: 'A4b', name: 'Busta Deluxe ex' },
  { id: 'B2b', name: 'Mega Splendore' },
  { id: 'B3', name: 'Aura Pulsante' },
  { id: 'B3a', name: 'Assalto dei Paradossi' },
  { id: 'B3b', name: 'Giorni Giocondi' },
  { id: 'B4', name: 'Sovrano dei Cieli' },
]

function normalizeDate(value) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

async function main() {
  const raw = await readFile(catalogPath, 'utf8')
  const catalog = JSON.parse(raw)
  const sets = Array.isArray(catalog.sets) ? catalog.sets : []
  const setById = new Map(sets.map((set) => [set.id, set]))

  const missing = expectedLatestSets.filter((set) => !setById.has(set.id))
  const futureSets = expectedLatestSets
    .map((expectedSet) => {
      const set = setById.get(expectedSet.id)
      if (!set) return null

      const releaseDate = normalizeDate(set.releaseDate)
      if (!releaseDate) return null

      return releaseDate > new Date()
        ? `${expectedSet.id} - ${expectedSet.name} (uscita prevista: ${set.releaseDate})`
        : null
    })
    .filter(Boolean)

  console.log('Verifica catalogo espansioni:')
  console.log(`Set presenti nel catalogo: ${sets.length}`)

  if (missing.length === 0) {
    console.log('OK: tutte le espansioni piu recenti attese risultano presenti.')
  } else {
    console.log('ATTENZIONE: mancano alcune espansioni attese nel catalogo finale:')
    for (const set of missing) {
      console.log(`- ${set.id} - ${set.name}`)
    }
  }

  if (futureSets.length > 0) {
    console.log('Nota: alcune espansioni presenti hanno una data di uscita futura:')
    for (const item of futureSets) {
      console.log(`- ${item}`)
    }
  }

  if (missing.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('ERRORE: impossibile verificare il catalogo finale.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
