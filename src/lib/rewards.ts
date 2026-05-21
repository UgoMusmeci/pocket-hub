import { rewardGuides } from '../data/rewards'
import { rewardOverrides } from '../data/rewardOverrides'
import { generatedRewardGuides } from '../data/generatedRewards'
import type { RewardAvailability, RewardGuide, RewardMethod, RewardType } from '../types/rewards'

export function getAllRewardCatalog() {
  const merged = new Map<string, RewardGuide>()

  generatedRewardGuides.forEach((reward) => {
    merged.set(`${reward.type}::${reward.name.toLowerCase()}`, reward)
  })

  rewardGuides.forEach((reward) => {
    merged.set(`${reward.type}::${reward.name.toLowerCase()}`, reward)
  })

  rewardOverrides.forEach((reward) => {
    merged.set(`${reward.type}::${reward.name.toLowerCase()}`, reward)
  })

  return [...merged.values()].sort((left, right) => left.name.localeCompare(right.name, 'it'))
}

export function getAllRewards() {
  return getAllRewardCatalog()
    .filter((reward) => reward.type === 'emblema')
    .sort((left, right) => left.name.localeCompare(right.name, 'it'))
}

export function getRewardCatalogBySlug(slug: string) {
  return getAllRewardCatalog().find((reward) => reward.slug === slug)
}

export function getEventEmblemBySlug(slug: string) {
  return getAllRewards().find((reward) => reward.slug === slug)
}

export function getRewardBySlug(slug: string) {
  return getAllRewards().find((reward) => reward.slug === slug)
}

const rewardTextReplacements: Array<[RegExp, string]> = [
  [/\bParticipation Emblema\b/g, 'Emblema partecipazione'],
  [/\bBronze Emblema\b/g, 'Emblema bronzo'],
  [/\bSilver Emblema\b/g, 'Emblema argento'],
  [/\bGold Emblema\b/g, 'Emblema oro'],
  [/\bSpecial Event 2025 Emblema\b/g, 'Emblema evento speciale 2025'],
  [/\bFirst Anniversary Celebration Emblema\b/g, 'Emblema celebrazione primo anniversario'],
  [/\bSP Emblem Event\b/g, 'evento emblema SP'],
  [/\bEmblem Event\b/g, 'evento emblema'],
  [/\bHalf-Year Celebration Event\b/g, 'evento celebrazione di metà anno'],
  [/\bFirst Anniversary\b/g, 'primo anniversario'],
  [/\bThemed Collection\b/g, 'collezione a tema'],
]

export function localizeRewardText(value: string) {
  return rewardTextReplacements.reduce((current, [pattern, replacement]) => {
    return current.replace(pattern, replacement)
  }, value)
}

export function localizeRewardName(name: string) {
  return localizeRewardText(name)
}

export function localizeRewardContext(context: string) {
  return localizeRewardText(context)
}

export function localizeRewardType(type: RewardType) {
  const labels: Record<RewardType, string> = {
    emblema: 'Emblema',
    moneta: 'Moneta',
    copertina_carte: 'Copertina carte',
    custodia_raccoglitore: 'Custodia raccoglitore',
    tabellone: 'Tabellone',
    icona: 'Icona',
  }

  return labels[type]
}

export function localizeRewardMethod(method: RewardMethod) {
  const labels: Record<RewardMethod, string> = {
    themed_collection: 'Collezione a tema / Cardex',
    missione: 'Missione',
    missione_segreta: 'Missione segreta',
    evento: 'Evento a tempo',
    shop: 'Shop',
    bundle: 'Bundle',
    premium: 'Ticket premium',
    iniziale: 'Ricompensa iniziale',
    bonus_accesso: 'Bonus accesso',
    archivio_gioco: 'Archivio del gioco',
    da_verificare: 'Archivio del gioco',
  }

  return labels[method]
}

export function localizeRewardAvailability(availability: RewardAvailability) {
  const labels: Record<RewardAvailability, string> = {
    ottenibile: 'Ottenibile',
    evento_scaduto: 'Evento scaduto',
    shop_bundle: 'Shop o bundle',
    storico: 'Storica / non sempre disponibile',
    catalogata: 'Presente nel gioco',
    da_verificare: 'Presente nel gioco',
  }

  return labels[availability]
}

export function getRewardTypeAccent(type: RewardType) {
  const accents: Record<RewardType, string> = {
    emblema: 'reward-accent-emblem',
    moneta: 'reward-accent-coin',
    copertina_carte: 'reward-accent-sleeve',
    custodia_raccoglitore: 'reward-accent-binder',
    tabellone: 'reward-accent-board',
    icona: 'reward-accent-icon',
  }

  return accents[type]
}

export function getRewardTypeBadgeIcon(type: RewardType) {
  const icons: Record<RewardType, string> = {
    emblema: '/reward-types/emblema.svg',
    moneta: '/reward-types/moneta.svg',
    copertina_carte: '/reward-types/custodia.svg',
    custodia_raccoglitore: '/reward-types/copertina.svg',
    tabellone: '/reward-types/tabellone.svg',
    icona: '/reward-types/icona.svg',
  }

  return icons[type]
}

export function matchesRewardSearch(reward: RewardGuide, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return [
    localizeRewardName(reward.name),
    reward.type,
    reward.method,
    reward.availability,
    localizeRewardContext(reward.sourceContext),
    localizeRewardText(reward.requirement),
    localizeRewardText(reward.description),
    reward.notes ?? '',
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalized)
}

export function formatRewardDate(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed)
}
