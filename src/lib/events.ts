import { eventGuides } from '../data/events'
import { getAllRewardCatalog, getAllRewards } from './rewards'
import type { EventGuide, EventType } from '../types/events'

export type EventStatus = 'attivo' | 'in_arrivo' | 'concluso'

export function getAllEvents() {
  return [...eventGuides].sort((left, right) => compareEvents(left, right))
}

export function getEventBySlug(slug: string) {
  return eventGuides.find((event) => event.slug === slug)
}

export function getRewardsForEvent(event: EventGuide) {
  const rewards = getAllRewards()
  return event.rewardSlugs
    .map((slug) => rewards.find((reward) => reward.slug === slug))
    .filter((reward): reward is NonNullable<typeof reward> => Boolean(reward))
}

export function getAdditionalRewardsForEvent(event: EventGuide) {
  const rewards = getAllRewardCatalog()
  return event.rewardSlugs
    .map((slug) => rewards.find((reward) => reward.slug === slug))
    .filter((reward): reward is NonNullable<typeof reward> => Boolean(reward))
    .filter((reward) => reward.type !== 'emblema')
}

export function getEventsForRewardSlug(rewardSlug: string) {
  return getAllEvents().filter((event) => event.rewardSlugs.includes(rewardSlug))
}

export function getEventStatus(event: EventGuide) {
  const today = new Date()
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)

  if (current < start) {
    return 'in_arrivo'
  }

  if (current > end) {
    return 'concluso'
  }

  return 'attivo'
}

function compareEvents(left: EventGuide, right: EventGuide) {
  const leftStatus = getEventStatus(left)
  const rightStatus = getEventStatus(right)
  const statusOrder: Record<EventStatus, number> = {
    attivo: 0,
    in_arrivo: 1,
    concluso: 2,
  }

  if (leftStatus !== rightStatus) {
    return statusOrder[leftStatus] - statusOrder[rightStatus]
  }

  if (leftStatus === 'concluso') {
    return right.endDate.localeCompare(left.endDate)
  }

  return right.startDate.localeCompare(left.startDate)
}

export function localizeEventType(type: EventType) {
  const labels: Record<EventType, string> = {
    emblem_event: 'Evento emblema',
    wonder_pick: 'Evento Wonder Pick',
    drop_event: 'Evento Drop',
    mass_outbreak: 'Evento apparizioni di massa',
    special_missions: 'Missioni speciali',
    special_event: 'Evento speciale',
  }

  return labels[type]
}

export function localizeEventStatus(status: EventStatus) {
  const labels: Record<EventStatus, string> = {
    attivo: 'Attivo',
    in_arrivo: 'In arrivo',
    concluso: 'Concluso',
  }

  return labels[status]
}

export function matchesEventSearch(event: EventGuide, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return [
    event.name,
    event.type,
    event.summary,
    event.description,
    event.linkedSetName ?? '',
    event.notes ?? '',
    ...event.consumableRewards,
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalized)
}

export function formatEventDate(date: string) {
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
