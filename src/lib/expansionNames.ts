export const expansionNameById = {
  A1: 'Geni Supremi',
  A1a: "L'Isola Misteriosa",
  A2: 'Scontro Spaziotemporale',
  A2a: 'Luce Trionfale',
  A2b: 'Tripudio Splendente',
  A3: 'Guardiani Astrali',
  A3a: 'Crisi Ultradimensionale',
  A3b: 'Il Bosco di Eevee',
  A4: 'La Via del Cielo e del Mare',
  A4a: 'Sorgenti Recondite',
  A4b: 'Busta Deluxe ex',
  B1: 'Mega Ascesa',
  B1a: 'Fiamme Cremisi',
  B2: 'Parata Fantasmagorica',
  B2a: 'Meraviglie di Paldea',
  B2b: 'Mega Splendore',
  B3: 'Aura Pulsante',
  B3a: 'Assalto dei Paradossi',
  B3b: 'Giorni Giocondi',
  B4: 'Sovrano dei Cieli',
  'P-A': 'Promo-A',
  'P-B': 'Promo-B',
} as const

export type ExpansionId = keyof typeof expansionNameById

export const expansionNames = Object.values(expansionNameById)

export const englishExpansionNameMap = {
  'Genetic Apex': expansionNameById.A1,
  'Mythical Island': expansionNameById.A1a,
  'Space-Time Smackdown': expansionNameById.A2,
  'Triumphant Light': expansionNameById.A2a,
  'Shining Revelry': expansionNameById.A2b,
  'Celestial Guardians': expansionNameById.A3,
  'Extradimensional Crisis': expansionNameById.A3a,
  'Eevee Grove': expansionNameById.A3b,
  'Wisdom of Sea and Sky': expansionNameById.A4,
  'Secluded Springs': expansionNameById.A4a,
  'Deluxe Pack ex': expansionNameById.A4b,
  'Mega Rising': expansionNameById.B1,
  'Crimson Blaze': expansionNameById.B1a,
  'Fantastical Parade': expansionNameById.B2,
  'Paldean Wonders': expansionNameById.B2a,
  'Mega Shine': expansionNameById.B2b,
  'Pulsing Aura': expansionNameById.B3,
  'Paradox Drive': expansionNameById.B3a,
  'Everyday Wonders': expansionNameById.B3b,
  'Promo-A': expansionNameById['P-A'],
  'Promo-B': expansionNameById['P-B'],
} as const

export function getExpansionNameById(expansionId?: string, fallback = '') {
  if (!expansionId) {
    return fallback
  }

  return expansionNameById[expansionId as ExpansionId] ?? fallback
}

export function localizeExpansionText(value?: string) {
  if (!value) {
    return value ?? ''
  }

  return Object.entries(englishExpansionNameMap).reduce(
    (localized, [englishName, italianName]) => localized.replaceAll(englishName, italianName),
    value,
  )
}
