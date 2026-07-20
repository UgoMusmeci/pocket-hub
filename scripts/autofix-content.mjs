import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const catalogPath = path.join(projectRoot, 'public', 'data', 'catalog.json')
const publicDir = path.join(projectRoot, 'public')

const cardPatches = {
  'B3a-007': {
    stage: 'Stage 1',
    attacks: [
      {
        name: 'Psychic',
        damage: '20+',
        effect:
          "This attack does 20 more damage for each Energy attached to your opponent's Active Pokemon.",
        cost: ['Colorless'],
      },
    ],
    weaknesses: [{ type: 'Lightning', value: '+20' }],
    retreat: 1,
  },
  'B3b-007': {
    stage: 'Stage 1',
  },
  'B3b-031': {
    stage: 'Basic',
    attacks: [
      {
        name: 'Glittering Gift',
        damage: undefined,
        effect:
          'Choose 2 of your Benched Pokemon. For each of those Pokemon, take a Psychic Energy from your Energy Zone and attach it to that Pokemon.',
        cost: ['Psychic'],
      },
    ],
    weaknesses: [{ type: 'Metal', value: '+20' }],
    retreat: 1,
  },
  'B3b-049': {
    stage: 'Stage 1',
  },
  'B3b-050': {
    stage: 'Stage 2',
  },
  'B3b-059': {
    stage: 'Basic',
  },
  'B3b-060': {
    stage: 'Stage 1',
  },
  'B3b-082': {
    stage: 'Stage 1',
  },
  'B3b-089': {
    stage: 'Stage 1',
  },
  'P-B-076': {
    stage: 'Basic',
  },
}

function hasNonEmptyValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function hasNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0
}

function applyCardPatch(card, patch) {
  let changed = false

  for (const [key, value] of Object.entries(patch)) {
    if (Array.isArray(value)) {
      if (!hasNonEmptyArray(card[key])) {
        card[key] = value
        changed = true
      }
      continue
    }

    if (!hasNonEmptyValue(card[key])) {
      card[key] = value
      changed = true
    }
  }

  return changed
}

function repairLocalImagePath(card) {
  if (!card.localImage) {
    return false
  }

  const localRelative = card.localImage.replace(/^\//, '').replaceAll('/', path.sep)
  const localAbsolute = path.join(publicDir, localRelative)

  if (existsSync(localAbsolute)) {
    return false
  }

  const jpgAbsolute = localAbsolute.replace(/\.(webp|png)$/i, '.jpg')
  const webpAbsolute = localAbsolute.replace(/\.(jpg|png)$/i, '.webp')

  if (/\.webp$/i.test(card.localImage) && existsSync(jpgAbsolute)) {
    card.localImage = card.localImage.replace(/\.webp$/i, '.jpg')
    return true
  }

  if (/\.jpg$/i.test(card.localImage) && existsSync(webpAbsolute)) {
    card.localImage = card.localImage.replace(/\.jpg$/i, '.webp')
    return true
  }

  return false
}

async function main() {
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
  let repairedImages = 0
  let patchedCards = 0

  for (const card of catalog.cards) {
    if (repairLocalImagePath(card)) {
      repairedImages += 1
    }

    const patch = cardPatches[card.id]
    if (patch && applyCardPatch(card, patch)) {
      patchedCards += 1
    }
  }

  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')

  console.log(
    JSON.stringify(
      {
        catalogPath,
        repairedImages,
        patchedCards,
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
