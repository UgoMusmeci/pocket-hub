import { getAllEvents } from './events'
import type { EventGuide } from '../types/events'
import type { RewardGuide } from '../types/rewards'

export type RewardOriginKind =
  | 'evento'
  | 'espansione'
  | 'premium'
  | 'shop'
  | 'bundle'
  | 'iniziale'
  | 'missione'
  | 'missione_segreta'
  | 'themed_collection'
  | 'bonus_accesso'
  | 'archivio'

export type RewardOriginDetails = {
  kind: RewardOriginKind
  label: string
  context: string
  linkedEvents: EventGuide[]
  linkedExpansionNames: string[]
  isPremiumReward: boolean
}

const expansionKeywords = [
  'Genetic Apex',
  'Mythical Island',
  'Space-Time Smackdown',
  'Triumphant Light',
  'Shining Revelry',
  'Celestial Guardians',
  'Extradimensional Crisis',
  'Wisdom of Sea and Sky',
  'Secluded Springs',
  'Deluxe Pack ex',
  'Eevee Grove',
  'Mega Rising',
  'Crimson Blaze',
  'Fantastical Parade',
  'Paldean Wonders',
  'Mega Shine',
  'Promo-A',
  'Promo-B',
]

function localizeOriginKind(kind: RewardOriginKind) {
  const labels: Record<RewardOriginKind, string> = {
    evento: 'Evento',
    espansione: 'Espansione',
    premium: 'Pass premium',
    shop: 'Shop',
    bundle: 'Bundle',
    iniziale: 'Ricompensa iniziale',
    missione: 'Missione',
    missione_segreta: 'Missione segreta',
    themed_collection: 'Themed Collection',
    bonus_accesso: 'Bonus accesso',
    archivio: 'Archivio del gioco',
  }

  return labels[kind]
}

function inferExpansionFromContext(sourceContext: string) {
  const normalized = sourceContext.trim().toLowerCase()
  if (!normalized) {
    return null
  }

  const exact = expansionKeywords.find((name) => name.toLowerCase() === normalized)
  if (exact) {
    return exact
  }

  return expansionKeywords.find((name) => normalized.includes(name.toLowerCase())) ?? null
}

function inferExpansionFromReward(reward: RewardGuide) {
  return inferExpansionFromContext(`${reward.name} ${reward.sourceContext}`)
}

export function getRewardOriginDetails(reward: RewardGuide): RewardOriginDetails {
  const linkedEvents = getAllEvents().filter((event) => event.rewardSlugs.includes(reward.slug))
  const linkedExpansionNames = [
    ...new Set(
      linkedEvents
        .map((event) => event.linkedSetName)
        .filter((name): name is string => Boolean(name)),
    ),
  ]

  const inferredExpansion = inferExpansionFromReward(reward)
  const mergedExpansionNames = linkedExpansionNames.length
    ? linkedExpansionNames
    : inferredExpansion
      ? [inferredExpansion]
      : []

  if (linkedEvents.length > 0) {
    return {
      kind: 'evento',
      label: localizeOriginKind('evento'),
      context: linkedEvents.length === 1 ? linkedEvents[0].name : 'Più eventi collegati',
      linkedEvents,
      linkedExpansionNames: mergedExpansionNames,
      isPremiumReward: reward.method === 'premium',
    }
  }

  if (reward.method === 'premium') {
    return {
      kind: 'premium',
      label: localizeOriginKind('premium'),
      context: reward.sourceContext,
      linkedEvents,
      linkedExpansionNames: mergedExpansionNames,
      isPremiumReward: true,
    }
  }

  if (mergedExpansionNames.length > 0) {
    return {
      kind: 'espansione',
      label: localizeOriginKind('espansione'),
      context: mergedExpansionNames.join(', '),
      linkedEvents,
      linkedExpansionNames: mergedExpansionNames,
      isPremiumReward: false,
    }
  }

  const kindByMethod: Partial<Record<RewardGuide['method'], RewardOriginKind>> = {
    shop: 'shop',
    bundle: 'bundle',
    iniziale: 'iniziale',
    missione: 'missione',
    missione_segreta: 'missione_segreta',
    themed_collection: 'themed_collection',
    bonus_accesso: 'bonus_accesso',
  }

  const mappedKind = kindByMethod[reward.method]
  if (mappedKind) {
    return {
      kind: mappedKind,
      label: localizeOriginKind(mappedKind),
      context: reward.sourceContext,
      linkedEvents,
      linkedExpansionNames: mergedExpansionNames,
      isPremiumReward: false,
    }
  }

  return {
    kind: 'archivio',
    label: localizeOriginKind('archivio'),
    context: reward.sourceContext,
    linkedEvents,
    linkedExpansionNames: mergedExpansionNames,
    isPremiumReward: false,
  }
}
