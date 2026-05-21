import type { EventGuide, EventType } from '../types/events'

const serebiiEventsUrl = 'https://www.serebii.net/tcgpocket/events.shtml'

type EventInput = {
  slug: string
  name: string
  type: EventType
  startDate: string
  endDate: string
  summary?: string
  description?: string
  consumableRewards?: string[]
  rewardSlugs?: string[]
  promoCardIds?: string[]
  imageUrl?: string
  imageAlt?: string
  linkedSetId?: string
  linkedSetName?: string
  notes?: string
  sourceLabel?: string
  sourceUrl?: string
}

const eventNameOverrides: Record<string, string> = {
  'charcadet-drop-event': 'Evento Drop di Charcadet',
  'bonus-week-missions-march-2026': 'Missioni bonus di marzo 2026',
  'wonder-pick-event-march-2026': 'Evento Wonder Pick di Pawmi e Clodsire di Paldea',
  'wonder-pick-event-april-2026': 'Evento Wonder Pick di Gastly e Wigglytuff',
  'special-drop-event-2026': 'Evento Drop speciale 2026',
  'slowpoke-drop-event': 'Evento Drop di Slowpoke',
  'community-week-missions-april-2026': 'Missioni Community Week di aprile 2026',
  'paldean-wonders-emblem-event': 'Evento emblema Paldean Wonders',
  '30-days-of-gifts': '30 giorni di regali',
  'wonder-pick-event-february-2026': 'Evento Wonder Pick di febbraio 2026',
  'mega-medicham-ex-drop-event': 'Evento Drop di Mega Medicham ex',
  'bonus-week-missions-february-2026': 'Missioni bonus di febbraio 2026',
  'fantastical-parade-emblem-event': 'Evento emblema Fantastical Parade',
  'handy-card-gift-missions': 'Missioni regalo carte utili',
  'elite-deck-gift-missions': 'Missioni regalo mazzi elite',
  'mega-latios-ex-drop-event': 'Evento Drop di Mega Latios ex',
  'wonder-pick-event-january-2026': 'Evento Wonder Pick di gennaio 2026',
  'bonus-week-missions-january-2026': 'Missioni bonus di gennaio 2026',
  'mareep-drop-event': 'Evento Drop di Mareep',
  'new-year-event-missions-2026': 'Missioni evento di Capodanno 2026',
  'holiday-event-missions-2025': 'Missioni evento festive 2025',
  'crimson-blaze-emblem-event': 'Evento emblema Crimson Blaze',
  'wonder-pick-event-december-2025': 'Evento Wonder Pick di dicembre 2025',
  'wonder-pick-event-november-2025': 'Evento Wonder Pick di novembre 2025',
  'first-anniversary-special-missions-part-2': 'Missioni speciali primo anniversario - Parte 2',
  'mega-pidgeot-ex-drop-event': 'Evento Drop di Mega Pidgeot ex',
  'bonus-week-missions-november-2025': 'Missioni bonus di novembre 2025',
  'mega-rising-emblem-event': 'Evento emblema Mega Rising',
  'promo-reissue-drop-event-2025': 'Evento Drop ristampa promo 2025',
  'promo-reissue-wonder-pick-event-2025': 'Evento Wonder Pick ristampa promo 2025',
  'first-anniversary-special-missions-part-1': 'Missioni speciali primo anniversario - Parte 1',
  'first-anniversary-countdown-missions': 'Missioni conto alla rovescia del primo anniversario',
  'parallel-foil-cards-mass-outbreak-event': 'Evento apparizioni di massa carte foil parallele',
  'wonder-pick-event-october-2025': 'Evento Wonder Pick di ottobre 2025',
  'bonus-week-missions-october-2025': 'Missioni bonus di ottobre 2025',
  'raichu-ex-drop-event': 'Evento Drop di Raichu ex',
  'water-type-mass-outbreak-event': 'Evento apparizioni di massa tipo Acqua',
  'wonder-pick-event-september-2025': 'Evento Wonder Pick di settembre 2025',
  'bonus-week-missions-september-2025': 'Missioni bonus di settembre 2025',
  'zoroark-drop-event': 'Evento Drop di Zoroark',
  'grass-type-mass-outbreak-event': 'Evento apparizioni di massa tipo Erba',
  'wonder-pick-event-march-2025-part-2': 'Evento Wonder Pick di marzo 2025 - Parte 2',
  'wonder-pick-event-march-2025-part-1': 'Evento Wonder Pick di marzo 2025 - Parte 1',
  'triumphant-light-sp-emblem-event': 'Evento emblema SP Triumphant Light',
  'gible-drop-event': 'Evento Drop di Gible',
  'darkness-type-mass-outbreak-event': 'Evento apparizioni di massa tipo Oscurita',
  'wonder-pick-event-february-2025-part-2': 'Evento Wonder Pick di febbraio 2025 - Parte 2',
  'wonder-pick-event-february-2025-part-1': 'Evento Wonder Pick di febbraio 2025 - Parte 1',
  'space-time-smackdown-emblem-event': 'Evento emblema Space-Time Smackdown',
  'cresselia-ex-drop-event': 'Evento Drop di Cresselia ex',
  'psychic-type-mass-outbreak-event': 'Evento apparizioni di massa tipo Psico',
  'mythical-island-sp-emblem-event': 'Evento emblema SP Mythical Island',
  'wonder-pick-event-january-2025-part-2': 'Evento Wonder Pick di gennaio 2025 - Parte 2',
  'wonder-pick-event-january-2025-part-1': 'Evento Wonder Pick di gennaio 2025 - Parte 1',
  'blastoise-drop-event': 'Evento Drop di Blastoise',
  'new-year-event-missions-2025': 'Missioni evento di Capodanno 2025',
  'lightning-type-mass-outbreak-event': 'Evento apparizioni di massa tipo Lampo',
  'holiday-event-missions-2024': 'Missioni evento festive 2024',
  'mythical-island-emblem-event': 'Evento emblema Mythical Island',
  'mega-shine-emblem-event': 'Evento emblema Mega Shine',
  'genetic-apex-sp-emblem-event-1': 'Evento emblema SP Genetic Apex 1',
  'half-year-celebration-event-2025': 'Evento celebrazione di meta anno 2025',
  'genetic-apex-emblem-event-1': 'Evento emblema Genetic Apex 1',
  'fire-type-mass-outbreak-event': 'Evento apparizioni di massa tipo Fuoco',
  'wonder-pick-event-november-2024-part-1': 'Evento Wonder Pick di novembre 2024 - Parte 1',
  'wonder-pick-event-november-2024-part-2': 'Evento Wonder Pick di novembre 2024 - Parte 2',
  'venusaur-drop-event': 'Evento Drop di Venusaur',
}

function getLocalizedEventName(slug: string, fallback: string) {
  return eventNameOverrides[slug] ?? fallback
}

function getDefaultSummary(type: EventType) {
  switch (type) {
    case 'emblem_event':
      return 'Evento competitivo a tempo che assegna emblemi in base ai risultati ottenuti nelle battaglie.'
    case 'wonder_pick':
      return 'Evento Wonder Pick con Bonus Pick, missioni e premi speciali a tema.'
    case 'drop_event':
      return 'Evento PvE con battaglie speciali, promo pack dedicati e missioni evento.'
    case 'mass_outbreak':
      return 'Evento con apparizioni di massa a tema, flair dedicate e missioni speciali.'
    case 'special_missions':
      return 'Evento missioni con obiettivi limitati nel tempo e premi variabili.'
    case 'special_event':
      return 'Evento speciale del gioco con premi esclusivi e bonus a tempo.'
  }
}

function getDefaultDescription(type: EventType, name: string) {
  switch (type) {
    case 'emblem_event':
      return `${name} è un evento competitivo limitato nel tempo: giochi contro altri giocatori e sblocchi emblemi progressivi in base ai risultati ottenuti.`
    case 'wonder_pick':
      return `${name} ruota attorno alle Wonder Pick del periodo: include Bonus Pick, missioni speciali e in alcuni casi accessori cosmetici dedicati.`
    case 'drop_event':
      return `${name} propone battaglie evento contro la CPU con ricompense progressive, promo pack e carte promo dedicate all'evento.`
    case 'mass_outbreak':
      return `${name} aumenta la presenza di carte e apparizioni a tema, spesso con missioni dedicate e una flair esclusiva collegata all'evento.`
    case 'special_missions':
      return `${name} raccoglie missioni a tempo con una combinazione di premi consumabili, carte e ricompense cosmetiche.`
    case 'special_event':
      return `${name} è un evento speciale del calendario di gioco, utile per seguire premi esclusivi, bonus e contenuti limitati nel tempo.`
  }
}

function getDefaultConsumables(type: EventType) {
  switch (type) {
    case 'emblem_event':
      return ['Pack Hourglass', 'Shinedust', 'Ticket negozio evento']
    case 'wonder_pick':
      return ['Wonder Hourglass', 'Ticket negozio evento', 'Bonus Pick']
    case 'drop_event':
      return ['Promo Pack dedicato', 'Event Hourglass', 'Shop Ticket', 'Shinedust']
    case 'mass_outbreak':
      return ['Wonder Hourglass', 'Shop Ticket', 'Flair dedicata']
    case 'special_missions':
      return ['Pack Hourglass', 'Wonder Hourglass', 'Shop Ticket', 'Shinedust']
    case 'special_event':
      return ['Pack Hourglass', 'Wonder Hourglass', 'Shop Ticket', 'Shinedust']
  }
}

const eventImageOverrides: Record<string, string> = {
  'charcadet-drop-event': '/card-images/B2a-019.jpg',
  'wonder-pick-event-march-2026': '/card-images/B2a-091.jpg',
  'wonder-pick-event-april-2026': '/card-images/P-B-047.jpg',
  'special-drop-event-2026': '/card-images/P-B-053.jpg',
  'slowpoke-drop-event': '/card-images/P-B-042.jpg',
  'community-week-missions-april-2026': '/rewards/seasons-tabellone.png',
  'paldean-wonders-emblem-event': '/rewards/paldean-wonders-emblem-event-participation-emblema.png',
  '30-days-of-gifts': '/rewards/moneta-pokemon-30th-celebration-design.png',
  'wonder-pick-event-february-2026': '/rewards/toxtricity-card-sleeve.png',
  'mega-medicham-ex-drop-event': '/card-images/P-B-029.jpg',
  'fantastical-parade-emblem-event': '/rewards/fantastical-parade-emblem-event-participation-emblema.png',
  'mega-shine-emblem-event': '/rewards/mega-shine-emblem-event-participation-emblema.png',
  'mega-latios-ex-drop-event': '/card-images/P-B-024.jpg',
  'wonder-pick-event-january-2026': '/rewards/goomy-copertina-carte.png',
  'mareep-drop-event': '/card-images/P-B-015.jpg',
  'new-year-event-missions-2026': '/rewards/the-new-year-with-pikachu-copertina-carte.png',
  'holiday-event-missions-2025': '/event-images/holiday-event-missions-2025.svg',
  'crimson-blaze-emblem-event': '/rewards/crimson-blaze-emblem-event-participation-emblema.png',
  'first-anniversary-special-missions-part-2': '/rewards/first-anniversary-celebration-emblema.png',
  'mega-pidgeot-ex-drop-event': '/card-images/P-B-006.jpg',
  'mega-rising-emblem-event': '/rewards/mega-rising-emblem-event-participation-emblema.png',
  'raichu-ex-drop-event': '/card-images/P-A-112.jpg',
  'zoroark-drop-event': '/card-images/P-A-106.jpg',
  'triumphant-light-sp-emblem-event': '/rewards/triumphant-light-sp-emblem-event-participation-emblema.png',
  'gible-drop-event': '/card-images/P-A-046.webp',
  'space-time-smackdown-emblem-event': '/rewards/space-time-smackdown-emblem-event-participation-emblema.png',
  'cresselia-ex-drop-event': '/card-images/P-A-037.webp',
  'mythical-island-sp-emblem-event': '/rewards/mythical-island-sp-emblem-event-participation-emblema.png',
  'blastoise-drop-event': '/card-images/A1-056.webp',
  'holiday-event-missions-2024': '/rewards/winter-holiday-frame-tabellone.png',
  'mythical-island-emblem-event': '/rewards/mythical-island-emblem-event-participation-emblema.png',
  'genetic-apex-sp-emblem-event-1': '/rewards/genetic-apex-sp-emblem-event-1-participation-emblema.png',
  'half-year-celebration-event-2025': '/rewards/special-event-2025-emblema.png',
  'genetic-apex-emblem-event-1': '/rewards/genetic-apex-emblem-event-1-participation-emblema.png',
  'venusaur-drop-event': '/card-images/A1-004.webp',
}

function getDefaultEventImage(input: EventInput) {
  return eventImageOverrides[input.slug] ?? `/event-images/${input.slug}.svg`
}

function createEvent(input: EventInput): EventGuide {
  const localizedName = getLocalizedEventName(input.slug, input.name)

  return {
    slug: input.slug,
    name: localizedName,
    type: input.type,
    startDate: input.startDate,
    endDate: input.endDate,
    summary: input.summary ?? getDefaultSummary(input.type),
    description: input.description ?? getDefaultDescription(input.type, localizedName),
    consumableRewards: input.consumableRewards ?? getDefaultConsumables(input.type),
    rewardSlugs: input.rewardSlugs ?? [],
    promoCardIds: input.promoCardIds ?? [],
    imageUrl: input.imageUrl ?? getDefaultEventImage(input),
    imageAlt: input.imageAlt ?? `Immagine rappresentativa di ${localizedName}`,
    linkedSetId: input.linkedSetId,
    linkedSetName: input.linkedSetName,
    notes: input.notes,
    sourceLabel: input.sourceLabel ?? 'Serebii Events',
    sourceUrl: input.sourceUrl ?? serebiiEventsUrl,
  }
}

const emblemRewardMap = {
  'genetic-apex-emblem-event-1': [
    'genetic-apex-emblem-event-1-participation-emblema',
    'genetic-apex-emblem-event-1-bronze-emblema',
    'genetic-apex-emblem-event-1-silver-emblema',
    'genetic-apex-emblem-event-1-gold-emblema',
  ],
  'space-time-smackdown-emblem-event': [
    'space-time-smackdown-emblem-event-participation-emblema',
    'space-time-smackdown-emblem-event-bronze-emblema',
    'space-time-smackdown-emblem-event-silver-emblema',
    'space-time-smackdown-emblem-event-gold-emblema',
  ],
  'mythical-island-emblem-event': [
    'mythical-island-emblem-event-participation-emblema',
    'mythical-island-emblem-event-bronze-emblema',
    'mythical-island-emblem-event-silver-emblema',
    'mythical-island-emblem-event-gold-emblema',
  ],
  'mythical-island-sp-emblem-event': [
    'mythical-island-sp-emblem-event-participation-emblema',
    'mythical-island-sp-emblem-event-bronze-emblema',
    'mythical-island-sp-emblem-event-silver-emblema',
    'mythical-island-sp-emblem-event-gold-emblema',
  ],
  'triumphant-light-sp-emblem-event': [
    'triumphant-light-sp-emblem-event-participation-emblema',
    'triumphant-light-sp-emblem-event-bronze-emblema',
    'triumphant-light-sp-emblem-event-silver-emblema',
    'triumphant-light-sp-emblem-event-gold-emblema',
  ],
  'paldean-wonders-emblem-event': [
    'paldean-wonders-emblem-event-participation-emblema',
    'paldean-wonders-emblem-event-bronze-emblema',
    'paldean-wonders-emblem-event-silver-emblema',
    'paldean-wonders-emblem-event-gold-emblema',
  ],
  'fantastical-parade-emblem-event': [
    'fantastical-parade-emblem-event-participation-emblema',
    'fantastical-parade-emblem-event-bronze-emblema',
    'fantastical-parade-emblem-event-silver-emblema',
    'fantastical-parade-emblem-event-gold-emblema',
  ],
  'crimson-blaze-emblem-event': [
    'crimson-blaze-emblem-event-participation-emblema',
    'crimson-blaze-emblem-event-bronze-emblema',
    'crimson-blaze-emblem-event-silver-emblema',
    'crimson-blaze-emblem-event-gold-emblema',
  ],
  'mega-rising-emblem-event': [
    'mega-rising-emblem-event-participation-emblema',
    'mega-rising-emblem-event-bronze-emblema',
    'mega-rising-emblem-event-silver-emblema',
    'mega-rising-emblem-event-gold-emblema',
  ],
  'mega-shine-emblem-event': [
    'mega-shine-emblem-event-participation-emblema',
    'mega-shine-emblem-event-bronze-emblema',
    'mega-shine-emblem-event-silver-emblema',
    'mega-shine-emblem-event-gold-emblema',
  ],
  'half-year-celebration-event-2025': ['special-event-2025-emblema'],
  'first-anniversary-special-missions-part-2': ['first-anniversary-celebration-emblema'],
  'wonder-pick-event-february-2026': [
    'toxtricity-coin',
    'toxtricity-copertina-carte',
    'toxtricity-custodia-raccoglitore',
    'toxtricity-card-sleeve',
    'toxtricity-playmat',
    'sky-of-shooting-stars-tabellone',
    'icona-cinderace',
  ],
  '30-days-of-gifts': [
    'moneta-pokemon-30th-celebration-design',
    'pokemon-30th-celebration-design-copertina-carte',
    'pokemon-30th-celebration-design-custodia-raccoglitore',
    'pokemon-30th-celebration-design-tabellone',
  ],
  'bonus-week-missions-march-2026': ['two-card-display-tabellone'],
  'wonder-pick-event-march-2026': [
    'arven-copertina-carte',
    'arven-custodia-raccoglitore',
    'moneta-arven',
    'field-of-adventure-tabellone',
    'arven-tabellone',
  ],
  'community-week-missions-april-2026': ['seasons-tabellone'],
  'special-drop-event-2026': ['icona-meloetta'],
  'wonder-pick-event-april-2026': [
    'mega-kangaskhan-copertina-carte',
    'mega-kangaskhan-tabellone',
    'moneta-mega-kangaskhan',
    'snowy-view-frame-tabellone',
    'icona-gastly',
  ],
  'wonder-pick-event-january-2026': [
    'goomy-copertina-carte',
    'goomy-custodia-raccoglitore',
    'moneta-goomy',
    'goomy-tabellone',
    'icona-goomy',
  ],
  'wonder-pick-event-november-2025': [
    'psyduck-copertina-carte',
    'psyduck-custodia-raccoglitore',
    'moneta-psyduck',
    'psyduck-tabellone',
    'autumn-leaves-tabellone',
    'icona-psyduck',
  ],
  'wonder-pick-event-december-2025': [
    'mega-gyarados-copertina-carte',
    'mega-gyarados-custodia-raccoglitore',
    'moneta-mega-gyarados',
    'magikarp-tabellone',
    'winter-holiday-2025-tabellone',
    'icona-magikarp',
  ],
  'wonder-pick-event-october-2025': [
    'professor-oak-copertina-carte',
    'professor-oak-custodia-raccoglitore',
    'moneta-professor-oak',
    'professor-oak-tabellone',
    'autumn-teatime-tabellone',
  ],
  'bonus-week-missions-january-2026': ['podiums-tabellone'],
  'new-year-event-missions-2026': [
    'the-new-year-with-pikachu-copertina-carte',
    'the-new-year-with-pikachu-custodia-raccoglitore',
    'new-year-with-pikachu-tabellone',
    'moneta-pikachu-ver-2',
  ],
  'holiday-event-missions-2024': ['winter-holiday-frame-tabellone'],
} as const

export const eventGuides: EventGuide[] = [
  createEvent({
    slug: 'special-drop-event-2026',
    name: 'Special Drop Event 2026',
    type: 'drop_event',
    startDate: '2026-04-29',
    endDate: '2026-05-09',
    rewardSlugs: [...emblemRewardMap['special-drop-event-2026']],
    promoCardIds: ['P-B-050', 'P-B-051', 'P-B-052', 'P-B-053', 'P-B-054', 'P-B-055'],
    consumableRewards: ['Promo Pack B serie Vol. 7', 'Event Hourglass', 'Shop Ticket', 'Shinedust'],
    description:
      'Evento drop celebrativo per il primo anno e mezzo di gioco, con promo pack dedicati a Zygarde e nuove ricompense cosmetiche a tema.',
    sourceLabel: 'Serebii Special Drop Event 2026',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/specialdropevent2026.shtml',
  }),
  createEvent({
    slug: 'wonder-pick-event-april-2026',
    name: 'Wonder Pick Event April 2026',
    type: 'wonder_pick',
    startDate: '2026-04-17',
    endDate: '2026-04-27',
    rewardSlugs: [...emblemRewardMap['wonder-pick-event-april-2026']],
    promoCardIds: ['P-B-047', 'P-B-048'],
    consumableRewards: [
      'Wonder Hourglass',
      'Ticket negozio evento Mega Kangaskhan',
      'Bonus Pick Gastly e Wigglytuff',
    ],
    description:
      'Evento Wonder Pick di aprile 2026 con promo dedicate a Gastly e Wigglytuff e accessori a tema Mega Kangaskhan.',
    sourceLabel: 'Serebii Wonder Pick Event April 2026',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/wonderpickeventapril2026.shtml',
  }),
  createEvent({
    slug: 'slowpoke-drop-event',
    name: 'Slowpoke Drop Event',
    type: 'drop_event',
    startDate: '2026-04-09',
    endDate: '2026-04-19',
    promoCardIds: ['P-B-042', 'P-B-043', 'P-B-044', 'P-B-045', 'P-B-046'],
    consumableRewards: ['Promo Pack B serie Vol. 6', 'Event Hourglass', 'Shop Ticket', 'Shinedust'],
    description:
      'Evento drop di aprile 2026 con promo pack a tema Slowpoke e battaglie evento contro mazzi ispirati a Mega Shine.',
    linkedSetId: 'B2b',
    linkedSetName: 'Mega Shine',
    sourceLabel: 'Serebii Slowpoke Drop Event',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/slowpokedropevent.shtml',
  }),
  createEvent({
    slug: 'community-week-missions-april-2026',
    name: 'Community Week Missions April 2026',
    type: 'special_missions',
    startDate: '2026-04-04',
    endDate: '2026-04-11',
    rewardSlugs: [...emblemRewardMap['community-week-missions-april-2026']],
    consumableRewards: ['Pack Hourglass', 'Wonder Hourglass', 'Trade Hourglass', 'Missioni community'],
    description:
      'Set di missioni community di aprile 2026 con premi social, materiali utili e il tabellone Seasons come ricompensa cosmetica principale.',
    sourceLabel: 'Serebii Community Week Missions April 2026',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/communityweekmissionsapril2026.shtml',
  }),
  createEvent({
    slug: 'mega-shine-emblem-event',
    name: 'Mega Shine Emblem Event',
    type: 'emblem_event',
    startDate: '2026-03-29',
    endDate: '2026-04-08',
    rewardSlugs: [...emblemRewardMap['mega-shine-emblem-event']],
    linkedSetId: 'B2b',
    linkedSetName: 'Mega Shine',
    sourceLabel: 'Serebii Mega Shine Emblem Event',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/megashineemblemevent.shtml',
  }),
  createEvent({
    slug: 'charcadet-drop-event',
    name: 'Charcadet Drop Event',
    type: 'drop_event',
    startDate: '2026-03-11',
    endDate: '2026-03-21',
    promoCardIds: ['P-B-035'],
  }),
  createEvent({
    slug: 'bonus-week-missions-march-2026',
    name: 'Bonus Week Missions March 2026',
    type: 'special_missions',
    startDate: '2026-03-07',
    endDate: '2026-03-14',
    rewardSlugs: [...emblemRewardMap['bonus-week-missions-march-2026']],
    consumableRewards: ['Pack Hourglass', 'Wonder Hourglass', 'Shop Ticket', 'Missioni settimana bonus'],
    description:
      'Settimana bonus di marzo 2026 con missioni giornaliere e il tabellone Two-card Display come ricompensa cosmetica principale.',
    sourceLabel: 'Serebii Bonus Week Missions March 2026',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/bonusweekmissionsmarch2026.shtml',
  }),
  createEvent({
    slug: 'wonder-pick-event-march-2026',
    name: 'Pawmi and Paldean Clodsire Wonder Pick Event',
    type: 'wonder_pick',
    startDate: '2026-03-06',
    endDate: '2026-03-16',
    rewardSlugs: [...emblemRewardMap['wonder-pick-event-march-2026']],
    consumableRewards: ['Wonder Hourglass', 'Ticket negozio evento', 'Bonus Pick Pawmi e Paldean Clodsire'],
    description:
      'Wonder Pick di marzo 2026 con accessori a tema Arven e Field of Adventure ottenibili tramite missioni evento e shop dedicato.',
    linkedSetId: 'B2a',
    linkedSetName: 'Paldean Wonders',
    sourceLabel: 'Serebii Pawmi and Paldean Clodsire Wonder Pick Event',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/pawmiandpaldeanclodsirewonderpickevent.shtml',
  }),
  createEvent({
    slug: 'paldean-wonders-emblem-event',
    name: 'Paldean Wonders Emblem Event',
    type: 'emblem_event',
    startDate: '2026-02-28',
    endDate: '2026-03-07',
    rewardSlugs: [...emblemRewardMap['paldean-wonders-emblem-event']],
    linkedSetId: 'B2a',
    linkedSetName: 'Paldean Wonders',
  }),
  createEvent({
    slug: '30-days-of-gifts',
    name: '30 Days of Gifts',
    type: 'special_event',
    startDate: '2026-02-27',
    endDate: '2026-06-27',
    rewardSlugs: [...emblemRewardMap['30-days-of-gifts']],
    consumableRewards: ['Pack Hourglass', 'Wonder Hourglass', 'Shinedust', 'Buoni giornalieri'],
    description:
      'Evento lungo pensato come calendario di ricompense: include premi consumabili giornalieri e una linea di accessori celebrativi Pokémon 30th.',
  }),
  createEvent({
    slug: 'wonder-pick-event-february-2026',
    name: 'Wonder Pick Event February 2026',
    type: 'wonder_pick',
    startDate: '2026-02-15',
    endDate: '2026-02-25',
    rewardSlugs: [...emblemRewardMap['wonder-pick-event-february-2026']],
    consumableRewards: ['Wonder Hourglass', 'Ticket negozio evento', 'Bonus Pick Toxtricity'],
    description:
      'Wonder Pick di febbraio 2026 con premi cosmetici a tema Toxtricity e missioni evento dedicate.',
  }),
  createEvent({
    slug: 'mega-medicham-ex-drop-event',
    name: 'Mega Medicham ex Drop Event',
    type: 'drop_event',
    startDate: '2026-02-12',
    endDate: '2026-02-22',
    promoCardIds: ['P-B-029'],
  }),
  createEvent({
    slug: 'bonus-week-missions-february-2026',
    name: 'Bonus Week Missions February 2026',
    type: 'special_missions',
    startDate: '2026-02-07',
    endDate: '2026-02-14',
  }),
  createEvent({
    slug: 'fantastical-parade-emblem-event',
    name: 'Fantastical Parade Emblem Event',
    type: 'emblem_event',
    startDate: '2026-02-02',
    endDate: '2026-02-09',
    rewardSlugs: [...emblemRewardMap['fantastical-parade-emblem-event']],
    linkedSetId: 'B2',
    linkedSetName: 'Fantastical Parade',
  }),
  createEvent({
    slug: 'handy-card-gift-missions',
    name: 'Handy Card Gift Missions',
    type: 'special_missions',
    startDate: '2026-01-30',
    endDate: '2026-04-27',
    consumableRewards: ['Pack Hourglass', 'Carte supporto utili', 'Mission Ticket'],
  }),
  createEvent({
    slug: 'elite-deck-gift-missions',
    name: 'Elite Deck Gift Missions',
    type: 'special_missions',
    startDate: '2026-01-30',
    endDate: '2026-04-27',
    consumableRewards: ['Deck ticket', 'Pack Hourglass', 'Carte staple', 'Mission Ticket'],
  }),
  createEvent({
    slug: 'mega-latios-ex-drop-event',
    name: 'Mega Latios ex Drop Event',
    type: 'drop_event',
    startDate: '2026-01-17',
    endDate: '2026-01-27',
    promoCardIds: ['P-B-024'],
  }),
  createEvent({
    slug: 'wonder-pick-event-january-2026',
    name: 'Wonder Pick Event January 2026',
    type: 'wonder_pick',
    startDate: '2026-01-09',
    endDate: '2026-01-19',
    rewardSlugs: [...emblemRewardMap['wonder-pick-event-january-2026']],
    consumableRewards: ['Wonder Hourglass', 'Ticket negozio evento', 'Bonus Pick Heliolisk e Buneary'],
    description:
      'Wonder Pick di gennaio 2026 con accessori a tema Goomy distribuiti tramite missioni e shop evento.',
    sourceLabel: 'Serebii Heliolisk and Buneary Wonder Pick Event',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/helioliskandbunearywonderpickevent.shtml',
  }),
  createEvent({
    slug: 'bonus-week-missions-january-2026',
    name: 'Bonus Week Missions January 2026',
    type: 'special_missions',
    startDate: '2026-01-04',
    endDate: '2026-01-11',
    rewardSlugs: [...emblemRewardMap['bonus-week-missions-january-2026']],
    consumableRewards: ['Pack Hourglass', 'Wonder Hourglass', 'Shop Ticket', 'Missioni settimana bonus'],
    description:
      'Settimana bonus di gennaio 2026 con missioni a tempo e il tabellone Podiums tra i premi cosmetici confermati.',
    sourceLabel: 'Serebii Bonus Week Missions January 2026',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/bonusweekmissionsjanuary2026.shtml',
  }),
  createEvent({
    slug: 'mareep-drop-event',
    name: 'Mareep Drop Event',
    type: 'drop_event',
    startDate: '2026-01-01',
    endDate: '2026-01-11',
    promoCardIds: ['P-B-015'],
  }),
  createEvent({
    slug: 'new-year-event-missions-2026',
    name: 'New Year Event Missions 2026',
    type: 'special_missions',
    startDate: '2026-01-01',
    endDate: '2026-01-08',
    rewardSlugs: [...emblemRewardMap['new-year-event-missions-2026']],
    consumableRewards: ['Pack Hourglass', 'Wonder Hourglass', 'Shop Ticket', 'Missioni a tema Capodanno'],
    description:
      'Missioni evento di Capodanno 2026 con accessori The New Year With Pikachu e la moneta Pikachu Ver. 2.',
    sourceLabel: 'Game8 New Year With Pikachu Accessories',
    sourceUrl: 'https://game8.co/games/Pokemon-TCG-Pocket/archives/573351',
  }),
  createEvent({
    slug: 'holiday-event-missions-2025',
    name: 'Holiday Event Missions 2025',
    type: 'special_missions',
    startDate: '2025-12-25',
    endDate: '2026-01-01',
  }),
  createEvent({
    slug: 'crimson-blaze-emblem-event',
    name: 'Crimson Blaze Emblem Event',
    type: 'emblem_event',
    startDate: '2025-12-21',
    endDate: '2025-12-31',
    rewardSlugs: [...emblemRewardMap['crimson-blaze-emblem-event']],
    linkedSetId: 'B1a',
    linkedSetName: 'Crimson Blaze',
  }),
  createEvent({
    slug: 'wonder-pick-event-december-2025',
    name: 'Wonder Pick Event December 2025',
    type: 'wonder_pick',
    startDate: '2025-12-07',
    endDate: '2025-12-17',
    rewardSlugs: [...emblemRewardMap['wonder-pick-event-december-2025']],
  }),
  createEvent({
    slug: 'wonder-pick-event-november-2025',
    name: 'Wonder Pick Event November 2025',
    type: 'wonder_pick',
    startDate: '2025-11-27',
    endDate: '2025-12-07',
    rewardSlugs: [...emblemRewardMap['wonder-pick-event-november-2025']],
  }),
  createEvent({
    slug: 'first-anniversary-special-missions-part-2',
    name: 'First Anniversary Special Missions Part 2',
    type: 'special_missions',
    startDate: '2025-11-22',
    endDate: '2025-12-17',
    rewardSlugs: [...emblemRewardMap['first-anniversary-special-missions-part-2']],
    consumableRewards: ['Mission Ticket anniversario', 'Pack Hourglass', 'Shinedust'],
  }),
  createEvent({
    slug: 'mega-pidgeot-ex-drop-event',
    name: 'Mega Pidgeot ex Drop Event',
    type: 'drop_event',
    startDate: '2025-11-18',
    endDate: '2025-11-28',
    promoCardIds: ['P-B-006'],
  }),
  createEvent({
    slug: 'bonus-week-missions-november-2025',
    name: 'Bonus Week Missions November 2025',
    type: 'special_missions',
    startDate: '2025-11-09',
    endDate: '2025-11-16',
  }),
  createEvent({
    slug: 'mega-rising-emblem-event',
    name: 'Mega Rising Emblem Event',
    type: 'emblem_event',
    startDate: '2025-11-07',
    endDate: '2025-11-17',
    rewardSlugs: [...emblemRewardMap['mega-rising-emblem-event']],
    linkedSetId: 'B1',
    linkedSetName: 'Mega Rising',
  }),
  createEvent({
    slug: 'promo-reissue-drop-event-2025',
    name: 'PROMO Reissue Drop Event 2025',
    type: 'drop_event',
    startDate: '2025-10-30',
    endDate: '2025-11-09',
  }),
  createEvent({
    slug: 'promo-reissue-wonder-pick-event-2025',
    name: 'PROMO Reissue Wonder Pick Event 2025',
    type: 'wonder_pick',
    startDate: '2025-10-30',
    endDate: '2025-11-09',
  }),
  createEvent({
    slug: 'first-anniversary-special-missions-part-1',
    name: 'First Anniversary Special Missions Part 1',
    type: 'special_missions',
    startDate: '2025-10-30',
    endDate: '2025-12-17',
    consumableRewards: ['Mission Ticket anniversario', 'Pack Hourglass', 'Shinedust'],
  }),
  createEvent({
    slug: 'first-anniversary-countdown-missions',
    name: 'First Anniversary Countdown Missions',
    type: 'special_missions',
    startDate: '2025-10-25',
    endDate: '2025-11-08',
  }),
  createEvent({
    slug: 'parallel-foil-cards-mass-outbreak-event',
    name: 'Parallel Foil Cards Mass Outbreak Event',
    type: 'mass_outbreak',
    startDate: '2025-10-23',
    endDate: '2025-10-30',
  }),
  createEvent({
    slug: 'wonder-pick-event-october-2025',
    name: 'Wonder Pick Event October 2025',
    type: 'wonder_pick',
    startDate: '2025-10-13',
    endDate: '2025-10-23',
    rewardSlugs: [...emblemRewardMap['wonder-pick-event-october-2025']],
  }),
  createEvent({
    slug: 'bonus-week-missions-october-2025',
    name: 'Bonus Week Missions October 2025',
    type: 'special_missions',
    startDate: '2025-10-12',
    endDate: '2025-10-19',
  }),
  createEvent({
    slug: 'raichu-ex-drop-event',
    name: 'Raichu ex Drop Event',
    type: 'drop_event',
    startDate: '2025-10-06',
    endDate: '2025-10-16',
    promoCardIds: ['P-A-112'],
  }),
  createEvent({
    slug: 'water-type-mass-outbreak-event',
    name: 'Water-type Mass Outbreak Event',
    type: 'mass_outbreak',
    startDate: '2025-09-25',
    endDate: '2025-10-01',
  }),
  createEvent({
    slug: 'wonder-pick-event-september-2025',
    name: 'Wonder Pick Event September 2025',
    type: 'wonder_pick',
    startDate: '2025-09-14',
    endDate: '2025-09-24',
  }),
  createEvent({
    slug: 'bonus-week-missions-september-2025',
    name: 'Bonus Week Missions September 2025',
    type: 'special_missions',
    startDate: '2025-09-07',
    endDate: '2025-09-14',
  }),
  createEvent({
    slug: 'zoroark-drop-event',
    name: 'Zoroark Drop Event',
    type: 'drop_event',
    startDate: '2025-09-03',
    endDate: '2025-09-13',
    promoCardIds: ['P-A-106'],
  }),
  createEvent({
    slug: 'grass-type-mass-outbreak-event',
    name: 'Grass-type Mass Outbreak Event',
    type: 'mass_outbreak',
    startDate: '2025-03-24',
    endDate: '2025-03-31',
  }),
  createEvent({
    slug: 'wonder-pick-event-march-2025-part-2',
    name: 'Wonder Pick Event March 2025 Part 2',
    type: 'wonder_pick',
    startDate: '2025-03-17',
    endDate: '2025-03-24',
  }),
  createEvent({
    slug: 'wonder-pick-event-march-2025-part-1',
    name: 'Wonder Pick Event March 2025 Part 1',
    type: 'wonder_pick',
    startDate: '2025-03-10',
    endDate: '2025-03-24',
  }),
  createEvent({
    slug: 'triumphant-light-sp-emblem-event',
    name: 'Triumphant Light SP Emblem Event',
    type: 'emblem_event',
    startDate: '2025-03-06',
    endDate: '2025-03-13',
    rewardSlugs: [...emblemRewardMap['triumphant-light-sp-emblem-event']],
    linkedSetId: 'A2a',
    linkedSetName: 'Triumphant Light',
  }),
  createEvent({
    slug: 'gible-drop-event',
    name: 'Gible Drop Event',
    type: 'drop_event',
    startDate: '2025-03-03',
    endDate: '2025-03-17',
    promoCardIds: ['P-A-046'],
  }),
  createEvent({
    slug: 'darkness-type-mass-outbreak-event',
    name: 'Darkness-type Mass Outbreak Event',
    type: 'mass_outbreak',
    startDate: '2025-02-21',
    endDate: '2025-02-28',
  }),
  createEvent({
    slug: 'wonder-pick-event-february-2025-part-2',
    name: 'Wonder Pick Event February 2025 Part 2',
    type: 'wonder_pick',
    startDate: '2025-02-14',
    endDate: '2025-02-21',
  }),
  createEvent({
    slug: 'wonder-pick-event-february-2025-part-1',
    name: 'Wonder Pick Event February 2025 Part 1',
    type: 'wonder_pick',
    startDate: '2025-02-07',
    endDate: '2025-02-21',
  }),
  createEvent({
    slug: 'space-time-smackdown-emblem-event',
    name: 'Space-Time Smackdown Emblem Event',
    type: 'emblem_event',
    startDate: '2025-02-04',
    endDate: '2025-02-18',
    rewardSlugs: [...emblemRewardMap['space-time-smackdown-emblem-event']],
    linkedSetId: 'A2',
    linkedSetName: 'Space-Time Smackdown',
  }),
  createEvent({
    slug: 'cresselia-ex-drop-event',
    name: 'Cresselia ex Drop Event',
    type: 'drop_event',
    startDate: '2025-02-03',
    endDate: '2025-02-17',
    promoCardIds: ['P-A-037'],
  }),
  createEvent({
    slug: 'psychic-type-mass-outbreak-event',
    name: 'Psychic-type Mass Outbreak Event',
    type: 'mass_outbreak',
    startDate: '2025-01-23',
    endDate: '2025-01-29',
  }),
  createEvent({
    slug: 'mythical-island-sp-emblem-event',
    name: 'Mythical Island SP Emblem Event',
    type: 'emblem_event',
    startDate: '2025-01-20',
    endDate: '2025-01-27',
    rewardSlugs: [...emblemRewardMap['mythical-island-sp-emblem-event']],
    linkedSetId: 'A1a',
    linkedSetName: 'Mythical Island',
  }),
  createEvent({
    slug: 'wonder-pick-event-january-2025-part-2',
    name: 'Wonder Pick Event January 2025 Part 2',
    type: 'wonder_pick',
    startDate: '2025-01-15',
    endDate: '2025-01-22',
  }),
  createEvent({
    slug: 'wonder-pick-event-january-2025-part-1',
    name: 'Wonder Pick Event January 2025 Part 1',
    type: 'wonder_pick',
    startDate: '2025-01-07',
    endDate: '2025-01-22',
  }),
  createEvent({
    slug: 'blastoise-drop-event',
    name: 'Blastoise Drop Event',
    type: 'drop_event',
    startDate: '2025-01-01',
    endDate: '2025-01-15',
    promoCardIds: ['P-A-029'],
  }),
  createEvent({
    slug: 'new-year-event-missions-2025',
    name: 'New Year Event Missions 2025',
    type: 'special_missions',
    startDate: '2025-01-01',
    endDate: '2025-01-07',
  }),
  createEvent({
    slug: 'lightning-type-mass-outbreak-event',
    name: 'Lightning-type Mass Outbreak Event',
    type: 'mass_outbreak',
    startDate: '2024-12-26',
    endDate: '2025-01-01',
  }),
  createEvent({
    slug: 'holiday-event-missions-2024',
    name: 'Holiday Event Missions 2024',
    type: 'special_missions',
    startDate: '2024-12-25',
    endDate: '2025-01-01',
    rewardSlugs: [...emblemRewardMap['holiday-event-missions-2024']],
    consumableRewards: ['Pack Hourglass', 'Wonder Hourglass', 'Shop Ticket', 'Missioni evento festive'],
    description:
      'Missioni evento festive di fine 2024 con il tabellone Winter Holiday Frame come ricompensa cosmetica dedicata.',
    sourceLabel: 'Game8 Winter Holiday Frame Backdrop',
    sourceUrl: 'https://game8.co/games/Pokemon-TCG-Pocket/archives/553880',
  }),
  createEvent({
    slug: 'genetic-apex-sp-emblem-event-1',
    name: 'Genetic Apex SP Emblem Event 1',
    type: 'emblem_event',
    startDate: '2024-12-09',
    endDate: '2024-12-16',
    rewardSlugs: [
      'genetic-apex-sp-emblem-event-1-participation-emblema',
      'genetic-apex-sp-emblem-event-1-bronze-emblema',
      'genetic-apex-sp-emblem-event-1-silver-emblema',
      'genetic-apex-sp-emblem-event-1-gold-emblema',
    ],
    linkedSetId: 'A1',
    linkedSetName: 'Genetic Apex',
    sourceLabel: 'Serebii Genetic Apex SP Emblem Event 1',
    sourceUrl: 'https://www.serebii.net/tcgpocket/events/geneticapexspemblemevent1.shtml',
  }),
  createEvent({
    slug: 'mythical-island-emblem-event',
    name: 'Mythical Island Emblem Event',
    type: 'emblem_event',
    startDate: '2024-12-20',
    endDate: '2025-01-10',
    rewardSlugs: [...emblemRewardMap['mythical-island-emblem-event']],
    linkedSetId: 'A1a',
    linkedSetName: 'Mythical Island',
  }),
  createEvent({
    slug: 'half-year-celebration-event-2025',
    name: 'Half-Year Celebration Event 2025',
    type: 'special_event',
    startDate: '2025-04-30',
    endDate: '2025-05-29',
    rewardSlugs: [...emblemRewardMap['half-year-celebration-event-2025']],
    consumableRewards: ['Pack Hourglass', 'Wonder Hourglass', 'Special Shop Ticket', 'Missioni celebrazione'],
    sourceLabel: 'Game8 List of Emblems',
    sourceUrl: 'https://game8.co/games/Pokemon-TCG-Pocket/archives/482689',
  }),
  createEvent({
    slug: 'genetic-apex-emblem-event-1',
    name: 'Genetic Apex Emblem Event 1',
    type: 'emblem_event',
    startDate: '2024-11-07',
    endDate: '2024-11-28',
    rewardSlugs: [...emblemRewardMap['genetic-apex-emblem-event-1']],
    linkedSetId: 'A1',
    linkedSetName: 'Genetic Apex',
  }),
  createEvent({
    slug: 'fire-type-mass-outbreak-event',
    name: 'Fire-type Mass Outbreak Event',
    type: 'mass_outbreak',
    startDate: '2024-11-22',
    endDate: '2024-11-29',
  }),
  createEvent({
    slug: 'wonder-pick-event-november-2024-part-1',
    name: 'Wonder Pick Event November 2024 Part 1',
    type: 'wonder_pick',
    startDate: '2024-11-01',
    endDate: '2024-11-15',
  }),
  createEvent({
    slug: 'wonder-pick-event-november-2024-part-2',
    name: 'Wonder Pick Event November 2024 Part 2',
    type: 'wonder_pick',
    startDate: '2024-11-08',
    endDate: '2024-11-15',
  }),
  createEvent({
    slug: 'venusaur-drop-event',
    name: 'Venusaur Drop Event',
    type: 'drop_event',
    startDate: '2024-11-29',
    endDate: '2024-12-13',
    promoCardIds: ['P-A-018'],
  }),
]
