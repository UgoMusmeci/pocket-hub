type EventConsumableVisual = {
  key: string
  label: string
  icon: string
  accent: string
}

export type EventConsumableItem = EventConsumableVisual & {
  raw: string
  quantity: number | null
  note?: string
}

const consumableVisuals: Array<{
  pattern: RegExp
  visual: EventConsumableVisual
}> = [
  {
    pattern: /pack hourglass/i,
    visual: {
      key: 'pack-hourglass',
      label: 'Clessidra buste',
      icon: '/event-consumables/pack-hourglass.svg',
      accent: 'consumable-accent-gold',
    },
  },
  {
    pattern: /wonder hourglass/i,
    visual: {
      key: 'wonder-hourglass',
      label: 'Clessidra pesca misteriosa',
      icon: '/event-consumables/wonder-hourglass.svg',
      accent: 'consumable-accent-blue',
    },
  },
  {
    pattern: /event hourglass/i,
    visual: {
      key: 'event-hourglass',
      label: 'Clessidra evento',
      icon: '/event-consumables/event-hourglass.svg',
      accent: 'consumable-accent-red',
    },
  },
  {
    pattern: /trade hourglass/i,
    visual: {
      key: 'trade-hourglass',
      label: 'Clessidra scambi',
      icon: '/event-consumables/trade-hourglass.svg',
      accent: 'consumable-accent-green',
    },
  },
  {
    pattern: /shinedust/i,
    visual: {
      key: 'shinedust',
      label: 'Polvere brillante',
      icon: '/event-consumables/shinedust.svg',
      accent: 'consumable-accent-violet',
    },
  },
  {
    pattern: /(shop ticket|ticket negozio evento|special shop ticket)/i,
    visual: {
      key: 'shop-ticket',
      label: 'Ticket negozio',
      icon: '/event-consumables/shop-ticket.svg',
      accent: 'consumable-accent-orange',
    },
  },
  {
    pattern: /promo pack/i,
    visual: {
      key: 'promo-pack',
      label: 'Pacchetto promo',
      icon: '/event-consumables/promo-pack.svg',
      accent: 'consumable-accent-pink',
    },
  },
  {
    pattern: /bonus pick/i,
    visual: {
      key: 'bonus-pick',
      label: 'Bonus Pick',
      icon: '/event-consumables/bonus-pick.svg',
      accent: 'consumable-accent-cyan',
    },
  },
  {
    pattern: /(mission ticket|missioni|buoni giornalieri)/i,
    visual: {
      key: 'mission-ticket',
      label: 'Missioni e ticket',
      icon: '/event-consumables/mission-ticket.svg',
      accent: 'consumable-accent-slate',
    },
  },
  {
    pattern: /(carte supporto utili|carte staple|deck ticket)/i,
    visual: {
      key: 'card-reward',
      label: 'Carte e ticket',
      icon: '/event-consumables/card-reward.svg',
      accent: 'consumable-accent-teal',
    },
  },
  {
    pattern: /flair/i,
    visual: {
      key: 'flair',
      label: 'Flair dedicata',
      icon: '/event-consumables/flair.svg',
      accent: 'consumable-accent-rose',
    },
  },
]

function extractQuantity(value: string) {
  const directMatch = value.match(/\b(\d+)\b/)
  if (!directMatch) {
    return null
  }

  const number = Number(directMatch[1])
  return Number.isFinite(number) ? number : null
}

function fallbackConsumable(raw: string): EventConsumableItem {
  return {
    key: raw,
    raw,
    label: raw,
    icon: '/event-consumables/generic-reward.svg',
    accent: 'consumable-accent-neutral',
    quantity: extractQuantity(raw),
  }
}

export function resolveEventConsumable(raw: string): EventConsumableItem {
  const normalized = raw.trim()
  const matched = consumableVisuals.find((entry) => entry.pattern.test(normalized))

  if (!matched) {
    return fallbackConsumable(normalized)
  }

  return {
    ...matched.visual,
    raw: normalized,
    quantity: extractQuantity(normalized),
  }
}
