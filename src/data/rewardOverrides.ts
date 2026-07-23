import type { RewardGuide } from '../types/rewards'
import { localizeExpansionText } from '../lib/expansionNames'

const serebiiEmblemsUrl = 'https://www.serebii.net/tcgpocket/emblems.shtml'
const serebiiThemedCollectionsUrl = 'https://www.serebii.net/tcgpocket/themedcollections.shtml'
const serebiiMegaShineEventUrl =
  'https://www.serebii.net/tcgpocket/events/megashineemblemevent.shtml'
const game8EmblemsUrl = 'https://game8.co/games/Pokemon-TCG-Pocket/archives/482689'
const game8ItemsUrl = 'https://game8.co/games/Pokemon-TCG-Pocket/archives/474429'
const game8SecretMissionsUrl = 'https://game8.co/games/Pokemon-TCG-Pocket/archives/483769'
const gamesRadarSecretMissionsUrl =
  'https://www.gamesradar.com/games/pokemon/pokemon-tcg-pocket-secret-missions/'
const wargamerShinyMewUrl =
  'https://www.wargamer.com/pokemon-tcg-pocket/shiny-mew-emblem'

type EmblemMethod = RewardGuide['method']
type EmblemAvailability = RewardGuide['availability']

type EmblemGuideInput = {
  slug: string
  name: string
  imageKey: string
  method: EmblemMethod
  availability: EmblemAvailability
  sourceContext: string
  requirement: string
  description: string
  sourceLabel: string
  sourceUrl: string
  notes?: string
  startDate?: string
  endDate?: string
}

function emblemImage(imageKey: string) {
  return `https://www.serebii.net/tcgpocket/emblems/${imageKey}.png`
}

function createEmblemGuide(input: EmblemGuideInput): RewardGuide {
  return {
    slug: input.slug,
    name: localizeExpansionText(input.name),
    type: 'emblema',
    imageUrl: `/rewards/${input.slug}.png`,
    sourceImageUrl: emblemImage(input.imageKey),
    method: input.method,
    availability: input.availability,
    sourceContext: localizeExpansionText(input.sourceContext),
    requirement: localizeExpansionText(input.requirement),
    description: localizeExpansionText(input.description),
    sourceLabel: localizeExpansionText(input.sourceLabel),
    sourceUrl: input.sourceUrl,
    notes: localizeExpansionText(input.notes),
    startDate: input.startDate,
    endDate: input.endDate,
  }
}

function createShopEmblem(
  slug: string,
  name: string,
  imageKey: string,
  setName: string,
  sourceUrl = serebiiEmblemsUrl,
  sourceLabel = 'Serebii Emblems',
) {
  return createEmblemGuide({
    slug,
    name,
    imageKey,
    method: 'shop',
    availability: 'ottenibile',
    sourceContext: setName,
    requirement: `Riscatta 100 Emblem Ticket di ${setName} nel negozio principale degli emblemi.`,
    description: `Emblema del set ${setName} acquistabile nello shop emblemi.`,
    sourceLabel,
    sourceUrl,
  })
}

function createThemedEmblem(
  slug: string,
  name: string,
  imageKey: string,
  setName: string,
  collectionName?: string,
  sourceUrl = serebiiEmblemsUrl,
  sourceLabel = 'Serebii Emblems',
) {
  const requirement = collectionName
    ? `Completa la missione segreta o raccolta tematica "${collectionName}" del set ${setName}.`
    : `Completa la raccolta tematica collegata al set ${setName}.`

  return createEmblemGuide({
    slug,
    name,
    imageKey,
    method: collectionName ? 'missione_segreta' : 'themed_collection',
    availability: 'ottenibile',
    sourceContext: setName,
    requirement,
    description: `Emblema sbloccabile completando obiettivi collezionistici legati a ${setName}.`,
    sourceLabel,
    sourceUrl,
  })
}

function createSecretMissionEmblem(
  slug: string,
  name: string,
  imageKey: string,
  sourceContext: string,
  missionName: string,
  requirement: string,
  sourceUrl = gamesRadarSecretMissionsUrl,
  sourceLabel = 'GamesRadar Secret Missions',
) {
  return createEmblemGuide({
    slug,
    name,
    imageKey,
    method: 'missione_segreta',
    availability: 'ottenibile',
    sourceContext,
    requirement: `${requirement} Completa la missione segreta "${missionName}".`,
    description: 'Emblema ottenibile tramite una missione segreta del gioco.',
    sourceLabel,
    sourceUrl,
  })
}

function createEventEmblem(
  slug: string,
  name: string,
  imageKey: string,
  eventName: string,
  requirement: string,
  sourceUrl = game8EmblemsUrl,
  sourceLabel = 'Game8 List of Emblems',
  startDate?: string,
  endDate?: string,
) {
  return createEmblemGuide({
    slug,
    name,
    imageKey,
    method: 'evento',
    availability: 'evento_scaduto',
    sourceContext: eventName,
    requirement,
    description: 'Emblema distribuito durante un evento competitivo a tempo limitato.',
    sourceLabel,
    sourceUrl,
    startDate,
    endDate,
  })
}

function createEventIcon(
  slug: string,
  name: string,
  imageKey: string,
  eventName: string,
  requirement: string,
  sourceUrl: string,
  sourceLabel: string,
  startDate?: string,
  endDate?: string,
) {
  return {
    slug,
    name: localizeExpansionText(name),
    type: 'icona',
    imageUrl: `/rewards/${slug}.png`,
    sourceImageUrl: `https://www.serebii.net/tcgpocket/icon/${imageKey}.png`,
    method: 'evento',
    availability: 'evento_scaduto',
    sourceContext: localizeExpansionText(eventName),
    requirement: localizeExpansionText(requirement),
    description: 'Icona profilo distribuita tramite un evento Wonder Pick a tempo limitato.',
    sourceLabel: localizeExpansionText(sourceLabel),
    sourceUrl,
    startDate,
    endDate,
  } satisfies RewardGuide
}

const shopEmblems = [
  createShopEmblem(
    'sprigatito-fuecoco-and-quaxly-emblema',
    'Sprigatito Fuecoco and Quaxly Emblema',
    'sprigatitofuecocoandquaxlyemblem',
    'Paldean Wonders',
  ),
  createShopEmblem('ogerpon-emblema', 'Ogerpon Emblema', 'ogerponemblem', 'Paldean Wonders'),
  createShopEmblem(
    'mega-gardevoir-emblema',
    'Mega Gardevoir Emblema',
    'megagardevoiremblem',
    'Fantastical Parade',
  ),
  createShopEmblem(
    'mega-charizard-y-emblema',
    'Mega Charizard Y Emblema',
    'megacharizardyemblem',
    'Crimson Blaze',
  ),
  createShopEmblem(
    'mega-altaria-emblema',
    'Mega Altaria Emblema',
    'megaaltariaemblem',
    'Mega Rising',
  ),
  createShopEmblem(
    'mega-gyarados-emblema',
    'Mega Gyarados Emblema',
    'megagyaradosemblem',
    'Mega Rising',
  ),
  createShopEmblem(
    'mega-blaziken-emblema',
    'Mega Blaziken Emblema',
    'megablazikenemblem',
    'Mega Rising',
  ),
  createShopEmblem(
    'greninja-emblema',
    'Greninja Emblema',
    'greninjaemblem',
    'Deluxe Pack ex',
  ),
  createShopEmblem(
    'oricorio-emblema',
    'Oricorio Emblema',
    'oricorioemblem',
    'Deluxe Pack ex',
  ),
  createShopEmblem(
    'suicune-emblema',
    'Suicune Emblema',
    'suicuneemblem',
    'Secluded Springs',
  ),
  createShopEmblem(
    'ho-oh-emblema',
    'Ho-Oh Emblema',
    'ho-ohemblem',
    'Wisdom of Sea and Sky',
  ),
  createShopEmblem(
    'lugia-emblema',
    'Lugia Emblema',
    'lugiaemblem',
    'Wisdom of Sea and Sky',
  ),
  createShopEmblem('eevee-emblema', 'Eevee Emblema', 'eeveeemblem', 'Eevee Grove'),
  createShopEmblem(
    'buzzwole-emblema',
    'Buzzwole Emblema',
    'buzzwoleemblem',
    'Extradimensional Crisis',
  ),
  createShopEmblem(
    'lunala-emblema',
    'Lunala Emblema',
    'lunalaemblem',
    'Celestial Guardians',
  ),
  createShopEmblem(
    'solgaleo-emblema',
    'Solgaleo Emblema',
    'solgaleoemblem',
    'Celestial Guardians',
  ),
  createShopEmblem(
    'giratina-emblema',
    'Giratina Emblema',
    'giratinaemblem',
    'Shining Revelry',
  ),
  createShopEmblem(
    'arceus-emblema',
    'Arceus Emblema',
    'arceusemblem',
    'Triumphant Light',
  ),
  createShopEmblem(
    'dialga-emblema',
    'Dialga Emblema',
    'dialgaemblem',
    'Space-Time Smackdown',
  ),
  createShopEmblem(
    'palkia-emblema',
    'Palkia Emblema',
    'palkiaemblem',
    'Space-Time Smackdown',
  ),
  createShopEmblem('mew-emblema', 'Mew Emblema', 'mewemblem', 'Mythical Island'),
  createShopEmblem(
    'charizard-emblema',
    'Charizard Emblema',
    'charizardemblem',
    'Genetic Apex',
  ),
  createShopEmblem(
    'mewtwo-emblema',
    'Mewtwo Emblema',
    'mewtwoemblem',
    'Genetic Apex',
  ),
  createShopEmblem(
    'pikachu-emblema',
    'Pikachu Emblema',
    'pikachuemblem',
    'Genetic Apex',
  ),
  createShopEmblem(
    'shiny-mega-gengar-emblema',
    'Shiny Mega Gengar Emblema',
    'shinymegagengaremblem',
    'Mega Shine',
    game8ItemsUrl,
    'Game8 All Collection Items',
  ),
]

const collectionEmblems = [
  createEmblemGuide({
    slug: 'roaring-moon-emblema',
    name: 'Roaring Moon Emblema',
    imageKey: 'roaringmoonemblem',
    method: 'themed_collection',
    availability: 'ottenibile',
    sourceContext: 'Paradox Drive',
    requirement: 'Completa la Themed Collection collegata a Roaring Moon in Paradox Drive.',
    description: 'Emblema sbloccabile completando una raccolta tematica del set Paradox Drive.',
    sourceLabel: 'Serebii Emblems',
    sourceUrl: serebiiEmblemsUrl,
  }),
  createEmblemGuide({
    slug: 'iron-valiant-emblema',
    name: 'Iron Valiant Emblema',
    imageKey: 'ironvaliantemblem',
    method: 'themed_collection',
    availability: 'ottenibile',
    sourceContext: 'Paradox Drive',
    requirement: 'Completa la Themed Collection collegata a Iron Valiant in Paradox Drive.',
    description: 'Emblema sbloccabile completando una raccolta tematica del set Paradox Drive.',
    sourceLabel: 'Serebii Emblems',
    sourceUrl: serebiiEmblemsUrl,
  }),
  createThemedEmblem(
    'mabosstiff-emblema',
    'Mabosstiff Emblema',
    'mabosstiffemblem',
    'Paldean Wonders',
  ),
  createThemedEmblem(
    'meowth-emblema',
    'Meowth Emblema',
    'meowthemblem',
    'Fantastical Parade',
  ),
  createThemedEmblem(
    'yamper-emblema',
    'Yamper Emblema',
    'yamperemblem',
    'Everyday Wonders',
    undefined,
    serebiiEmblemsUrl,
    'Serebii Emblems',
  ),
  createThemedEmblem(
    'mantyke-emblema',
    'Mantyke Emblema',
    'mantykeemblem',
    'Secluded Springs',
    'Pokémon that can use Attacks Immediately 2',
    serebiiThemedCollectionsUrl,
    'Serebii Themed Collections',
  ),
  createThemedEmblem(
    'smeargle-emblema',
    'Smeargle Emblema',
    'smeargleemblem',
    'Deluxe Pack ex',
    "Smeargle's Colorful Collection",
    game8EmblemsUrl,
    'Game8 List of Emblems',
  ),
]

const pulsingAuraEmblems = [
  createEmblemGuide({
    slug: 'mega-lucario-emblema',
    name: 'Mega Lucario Emblema',
    imageKey: 'megalucarioemblem',
    method: 'missione',
    availability: 'ottenibile',
    sourceContext: 'Pulsing Aura',
    requirement: 'Raccogli tutte le 155 carte Diamante di Pulsing Aura.',
    description: 'Emblema di Pulsing Aura ottenibile completando la raccolta completa delle carte Diamante del set.',
    sourceLabel: 'Serebii Pulsing Aura',
    sourceUrl: 'https://www.serebii.net/tcgpocket/pulsingaura/',
  }),
  createEmblemGuide({
    slug: 'mega-sceptile-emblema',
    name: 'Mega Sceptile Emblema',
    imageKey: 'megasceptileemblem',
    method: 'missione',
    availability: 'ottenibile',
    sourceContext: 'Pulsing Aura',
    requirement: 'Raccogli 100 carte di Pulsing Aura.',
    description: 'Emblema di Pulsing Aura ottenibile avanzando nella raccolta principale del set.',
    sourceLabel: 'Serebii Pulsing Aura',
    sourceUrl: 'https://www.serebii.net/tcgpocket/pulsingaura/',
  }),
  createThemedEmblem(
    'sobble-emblema',
    'Sobble Emblema',
    'sobbleemblem',
    'Pulsing Aura',
    undefined,
    'https://www.serebii.net/tcgpocket/pulsingaura/',
    'Serebii Pulsing Aura',
  ),
]

const setCompletionEmblems = [
  createEmblemGuide({
    slug: 'koraidon-miraidon-emblema',
    name: 'Koraidon & Miraidon Emblema',
    imageKey: 'koraidon&miraidonemblem',
    method: 'missione',
    availability: 'ottenibile',
    sourceContext: 'Paradox Drive',
    requirement: 'Raccogli tutte le 74 carte Diamante di Paradox Drive.',
    description: 'Emblema del set Paradox Drive ottenibile completando la raccolta principale delle carte Diamante.',
    sourceLabel: 'Serebii Emblems',
    sourceUrl: serebiiEmblemsUrl,
  }),
  createEmblemGuide({
    slug: 'sylveon-emblema',
    name: 'Sylveon Emblema',
    imageKey: 'sylveonemblem',
    method: 'missione',
    availability: 'ottenibile',
    sourceContext: 'Everyday Wonders',
    requirement: 'Raccogli tutte le 69 carte Diamante di Everyday Wonders.',
    description: 'Emblema del set Everyday Wonders ottenibile completando la raccolta principale delle carte Diamante.',
    sourceLabel: 'Serebii Emblems',
    sourceUrl: serebiiEmblemsUrl,
  }),
]

const secretMissionEmblems = [
  createSecretMissionEmblem(
    'celebi-emblema',
    'Celebi Emblema',
    'celebiemblem',
    'Mythical Island',
    'Mythical Island Tale of Adventure',
    'Raccogli Mythical Slab, Budding Expeditioner, Mew ex immersiva e Celebi ex immersiva.',
    game8SecretMissionsUrl,
    'Game8 Secret Missions',
  ),
  createSecretMissionEmblem(
    'garchomp-emblema',
    'Garchomp Emblema',
    'garchompemblem',
    'Triumphant Light',
    'Champion of the Sinnoh Region',
    'Raccogli Spiritomb, Gastrodon, Lucario, Garchomp e la Cynthia a 2 stelle della serie.',
    game8SecretMissionsUrl,
    'Game8 Secret Missions',
  ),
  createSecretMissionEmblem(
    'shaymin-emblema',
    'Shaymin Emblema',
    'shayminemblem',
    'Triumphant Light',
    'Pokemon from Ancient Records',
    'Raccogli Origin Forme Dialga, Origin Forme Palkia, Giratina, Arceus ex, Heatran, Shaymin full art e la variante full art di Celestic Town Elder.',
    game8SecretMissionsUrl,
    'Game8 Secret Missions',
  ),
  createSecretMissionEmblem(
    'gholdengo-emblema',
    'Gholdengo Emblema',
    'gholdengoemblem',
    'Shining Revelry',
    'Gimmighoul Collection',
    'Raccogli 99 copie della carta Gimmighoul.',
    game8SecretMissionsUrl,
    'Game8 Secret Missions',
  ),
  createSecretMissionEmblem(
    'mega-venusaur-emblema',
    'Mega Venusaur Emblema',
    'megavenusauremblem',
    'Crimson Blaze',
    "Mega Venusaur's Evolution",
    'Raccogli Bulbasaur, Ivysaur, Venusaur, Mega Venusaur ex a 1 stella e Mega Venusaur ex a 2 stelle.',
  ),
  createSecretMissionEmblem(
    'mega-blastoise-emblema',
    'Mega Blastoise Emblema',
    'megablastoiseemblem',
    'Crimson Blaze',
    'A Multitude of Mega Evolution Pokemon',
    'Raccogli una variante qualsiasi di Mega Venusaur ex, Mega Charizard Y ex, Mega Blastoise ex, Mega Lopunny ex e Mega Steelix ex.',
  ),
  createSecretMissionEmblem(
    'mega-pinsir-emblema',
    'Mega Pinsir Emblema',
    'megapinsiremblem',
    'Mega Rising',
    'A Swarm of Bug Pokémon!',
    'Raccogli le tre varianti full art di Alolan Dugtrio ex e l intera selezione di Pokémon Coleottero richiesta dalla missione segreta.',
    gamesRadarSecretMissionsUrl,
    'GamesRadar Secret Missions',
  ),
  createSecretMissionEmblem(
    'alolan-dugtrio-emblema',
    'Alolan Dugtrio Emblema',
    'alolandugtrioemblem',
    'Extradimensional Crisis',
    'A Trio with Impressive Whiskers',
    'Raccogli tre varianti full art di Alolan Dugtrio ex.',
    gamesRadarSecretMissionsUrl,
    'GamesRadar Secret Missions',
  ),
  createSecretMissionEmblem(
    'alcremie-emblema',
    'Alcremie Emblema',
    'alcremieemblem',
    'Eevee Grove',
    'A Sweets Party of Epic Proportions',
    'Raccogli 100 carte tra Appletun, Vanillite, Vanillish, Swirlix, Slurpuff, Milcery e Alcremie.',
    gamesRadarSecretMissionsUrl,
    'GamesRadar Secret Missions',
  ),
  createSecretMissionEmblem(
    'wishiwashi-emblema',
    'Wishiwashi Emblema',
    'wishiwashiemblem',
    'Celestial Guardians',
    "Wishiwashi and 1's School",
    'Raccogli Lana e tutte e quattro le varianti di Wishiwashi richieste dalla missione segreta.',
    gamesRadarSecretMissionsUrl,
    'GamesRadar Secret Missions',
  ),
  createSecretMissionEmblem(
    'pikachu-ver-2-emblema',
    'Pikachu ver. 2 Emblema',
    'pikachuver.2emblem',
    'Deluxe Pack ex',
    'Very Very Light Pokémon',
    'Completa la raccolta segreta Very Very Light Pokémon del set Deluxe Pack ex.',
    serebiiThemedCollectionsUrl,
    'Serebii Themed Collections',
  ),
  createSecretMissionEmblem(
    'articuno-zapdos-moltres-emblema',
    'Articuno Zapdos Moltres Emblema',
    'articunozapdosmoltresemblem',
    'Genetic Apex',
    'The Legendary Flight Continues',
    'Raccogli le varianti full art di Moltres ex, Zapdos ex e Articuno ex.',
  ),
  createSecretMissionEmblem(
    'shiny-mew-emblema',
    'Shiny Mew Emblema',
    'shinymewemblem',
    'Mega Shine',
    'Shiny Collection Complete!',
    'Raccogli tutte le 30 carte shiny di Mega Shine, inclusa la variante immersiva di Mew shiny.',
    wargamerShinyMewUrl,
    'Wargamer Shiny Mew Emblem',
  ),
]

const celebrationEmblems = [
  createEmblemGuide({
    slug: 'special-event-2025-emblema',
    name: 'Special Event 2025 Emblema',
    imageKey: 'specialevent2025emblem',
    method: 'evento',
    availability: 'evento_scaduto',
    sourceContext: 'Half-Year Celebration Event 2025',
    requirement: 'Completa le missioni speciali dell evento Half-Year Celebration 2025.',
    description: 'Emblema celebrativo ottenibile durante un evento speciale a tempo limitato.',
    sourceLabel: 'Game8 List of Emblems',
    sourceUrl: game8EmblemsUrl,
  }),
  createEmblemGuide({
    slug: 'first-anniversary-celebration-emblema',
    name: 'First Anniversary Celebration Emblema',
    imageKey: 'firstanniversarycelebrationemblem',
    method: 'evento',
    availability: 'evento_scaduto',
    sourceContext: 'First Year Anniversary Celebration Event Part 1',
    requirement: 'Completa le missioni speciali dell evento per il primo anniversario del gioco.',
    description: 'Emblema celebrativo distribuito durante il primo anniversario di Pokémon TCG Pocket.',
    sourceLabel: 'Game8 List of Emblems',
    sourceUrl: game8EmblemsUrl,
  }),
]

const eventIcons = [
  createEventIcon(
    'icona-psyduck',
    'Icona Psyduck',
    'psyduck',
    'Wonder Pick Event November 2025',
    'Scambia 2 Event Shop Ticket Psyduck durante il Wonder Pick Event di novembre 2025.',
    'https://www.serebii.net/tcgpocket/events/wonderpickeventnovember2025.shtml',
    'Serebii Wonder Pick Event November 2025',
    '2025-11-27',
    '2025-12-07',
  ),
  createEventIcon(
    'icona-magikarp',
    'Icona Magikarp',
    'magikarp',
    'Wonder Pick Event December 2025',
    'Scambia 2 Event Shop Ticket Mega Gyarados durante il Wonder Pick Event di dicembre 2025.',
    'https://www.serebii.net/tcgpocket/events/wonderpickeventdecember2025.shtml',
    'Serebii Wonder Pick Event December 2025',
    '2025-12-07',
    '2025-12-17',
  ),
]

const eventEmblems = [
  createEventEmblem(
    'genetic-apex-emblem-event-1-participation-emblema',
    'Genetic Apex Emblem Event 1 Participation Emblema',
    'geneticapexemblemevent1participationemblem',
    'Genetic Apex Emblem Event 1',
    'Vinci 1 battaglia durante il Genetic Apex Emblem Event 1.',
  ),
  createEventEmblem(
    'genetic-apex-emblem-event-1-bronze-emblema',
    'Genetic Apex Emblem Event 1 Bronze Emblema',
    'geneticapexemblemevent1bronzeemblem',
    'Genetic Apex Emblem Event 1',
    'Vinci 5 battaglie durante il Genetic Apex Emblem Event 1.',
  ),
  createEventEmblem(
    'genetic-apex-emblem-event-1-silver-emblema',
    'Genetic Apex Emblem Event 1 Silver Emblema',
    'geneticapexemblemevent1silveremblem',
    'Genetic Apex Emblem Event 1',
    'Vinci 25 battaglie durante il Genetic Apex Emblem Event 1.',
  ),
  createEventEmblem(
    'genetic-apex-emblem-event-1-gold-emblema',
    'Genetic Apex Emblem Event 1 Gold Emblema',
    'geneticapexemblemevent1goldemblem',
    'Genetic Apex Emblem Event 1',
    'Vinci 45 battaglie durante il Genetic Apex Emblem Event 1.',
  ),
  createEventEmblem(
    'genetic-apex-sp-emblem-event-1-participation-emblema',
    'Genetic Apex SP Emblem Event 1 Participation Emblema',
    'geneticapexspemblemevent1participationemblem',
    'Genetic Apex SP Emblem Event 1',
    'Ottieni 2 vittorie consecutive nel Genetic Apex SP Emblem Event 1.',
  ),
  createEventEmblem(
    'genetic-apex-sp-emblem-event-1-bronze-emblema',
    'Genetic Apex SP Emblem Event 1 Bronze Emblema',
    'geneticapexspemblemevent1bronzeemblem',
    'Genetic Apex SP Emblem Event 1',
    'Ottieni 3 vittorie consecutive nel Genetic Apex SP Emblem Event 1.',
  ),
  createEventEmblem(
    'genetic-apex-sp-emblem-event-1-silver-emblema',
    'Genetic Apex SP Emblem Event 1 Silver Emblema',
    'geneticapexspemblemevent1silveremblem',
    'Genetic Apex SP Emblem Event 1',
    'Ottieni 4 vittorie consecutive nel Genetic Apex SP Emblem Event 1.',
  ),
  createEventEmblem(
    'genetic-apex-sp-emblem-event-1-gold-emblema',
    'Genetic Apex SP Emblem Event 1 Gold Emblema',
    'geneticapexspemblemevent1goldemblem',
    'Genetic Apex SP Emblem Event 1',
    'Ottieni 5 vittorie consecutive nel Genetic Apex SP Emblem Event 1.',
  ),
  createEventEmblem(
    'mythical-island-emblem-event-participation-emblema',
    'Mythical Island Emblem Event Participation Emblema',
    'mythicalislandemblemeventparticipationemblem',
    'Mythical Island Emblem Event',
    'Vinci 1 battaglia durante il Mythical Island Emblem Event.',
  ),
  createEventEmblem(
    'mythical-island-emblem-event-bronze-emblema',
    'Mythical Island Emblem Event Bronze Emblema',
    'mythicalislandemblemeventbronzeemblem',
    'Mythical Island Emblem Event',
    'Vinci 5 battaglie durante il Mythical Island Emblem Event.',
  ),
  createEventEmblem(
    'mythical-island-emblem-event-silver-emblema',
    'Mythical Island Emblem Event Silver Emblema',
    'mythicalislandemblemeventsilveremblem',
    'Mythical Island Emblem Event',
    'Vinci 25 battaglie durante il Mythical Island Emblem Event.',
  ),
  createEventEmblem(
    'mythical-island-emblem-event-gold-emblema',
    'Mythical Island Emblem Event Gold Emblema',
    'mythicalislandemblemeventgoldemblem',
    'Mythical Island Emblem Event',
    'Vinci 45 battaglie durante il Mythical Island Emblem Event.',
  ),
  createEventEmblem(
    'mythical-island-sp-emblem-event-participation-emblema',
    'Mythical Island SP Emblem Event Participation Emblema',
    'mythicalislandspemblemeventparticipationemblem',
    'Mythical Island SP Emblem Event',
    'Ottieni 2 vittorie consecutive nel Mythical Island SP Emblem Event.',
  ),
  createEventEmblem(
    'mythical-island-sp-emblem-event-bronze-emblema',
    'Mythical Island SP Emblem Event Bronze Emblema',
    'mythicalislandspemblemeventbronzeemblem',
    'Mythical Island SP Emblem Event',
    'Ottieni 3 vittorie consecutive nel Mythical Island SP Emblem Event.',
  ),
  createEventEmblem(
    'mythical-island-sp-emblem-event-silver-emblema',
    'Mythical Island SP Emblem Event Silver Emblema',
    'mythicalislandspemblemeventsilveremblem',
    'Mythical Island SP Emblem Event',
    'Ottieni 4 vittorie consecutive nel Mythical Island SP Emblem Event.',
  ),
  createEventEmblem(
    'mythical-island-sp-emblem-event-gold-emblema',
    'Mythical Island SP Emblem Event Gold Emblema',
    'mythicalislandspemblemeventgoldemblem',
    'Mythical Island SP Emblem Event',
    'Ottieni 5 vittorie consecutive nel Mythical Island SP Emblem Event.',
  ),
  createEventEmblem(
    'space-time-smackdown-emblem-event-participation-emblema',
    'Space-Time Smackdown Emblem Event Participation Emblema',
    'space-timesmackdownemblemeventparticipationemblem',
    'Space-Time Smackdown Emblem Event',
    'Vinci 1 battaglia durante lo Space-Time Smackdown Emblem Event.',
  ),
  createEventEmblem(
    'space-time-smackdown-emblem-event-bronze-emblema',
    'Space-Time Smackdown Emblem Event Bronze Emblema',
    'space-timesmackdownemblemeventbronzeemblem',
    'Space-Time Smackdown Emblem Event',
    'Vinci 5 battaglie durante lo Space-Time Smackdown Emblem Event.',
  ),
  createEventEmblem(
    'space-time-smackdown-emblem-event-silver-emblema',
    'Space-Time Smackdown Emblem Event Silver Emblema',
    'space-timesmackdownemblemeventsilveremblem',
    'Space-Time Smackdown Emblem Event',
    'Vinci 25 battaglie durante lo Space-Time Smackdown Emblem Event.',
  ),
  createEventEmblem(
    'space-time-smackdown-emblem-event-gold-emblema',
    'Space-Time Smackdown Emblem Event Gold Emblema',
    'space-timesmackdownemblemeventgoldemblem',
    'Space-Time Smackdown Emblem Event',
    'Vinci 45 battaglie durante lo Space-Time Smackdown Emblem Event.',
  ),
  createEventEmblem(
    'triumphant-light-sp-emblem-event-participation-emblema',
    'Triumphant Light SP Emblem Event Participation Emblema',
    'triumphantlightspemblemeventparticipationemblem',
    'Triumphant Light SP Emblem Event',
    'Ottieni 2 vittorie consecutive nel Triumphant Light SP Emblem Event.',
  ),
  createEventEmblem(
    'triumphant-light-sp-emblem-event-bronze-emblema',
    'Triumphant Light SP Emblem Event Bronze Emblema',
    'triumphantlightspemblemeventbronzeemblem',
    'Triumphant Light SP Emblem Event',
    'Ottieni 3 vittorie consecutive nel Triumphant Light SP Emblem Event.',
  ),
  createEventEmblem(
    'triumphant-light-sp-emblem-event-silver-emblema',
    'Triumphant Light SP Emblem Event Silver Emblema',
    'triumphantlightspemblemeventsilveremblem',
    'Triumphant Light SP Emblem Event',
    'Ottieni 4 vittorie consecutive nel Triumphant Light SP Emblem Event.',
  ),
  createEventEmblem(
    'triumphant-light-sp-emblem-event-gold-emblema',
    'Triumphant Light SP Emblem Event Gold Emblema',
    'triumphantlightspemblemeventgoldemblem',
    'Triumphant Light SP Emblem Event',
    'Ottieni 5 vittorie consecutive nel Triumphant Light SP Emblem Event.',
  ),
  createEventEmblem(
    'paldean-wonders-emblem-event-participation-emblema',
    'Paldean Wonders Emblem Event Participation Emblema',
    'paldeanwondersemblemeventparticipationemblem',
    'Paldean Wonders Emblem Event',
    'Ottieni 1 vittoria durante il Paldean Wonders Emblem Event.',
  ),
  createEventEmblem(
    'paldean-wonders-emblem-event-bronze-emblema',
    'Paldean Wonders Emblem Event Bronze Emblema',
    'paldeanwondersemblemeventbronzeemblem',
    'Paldean Wonders Emblem Event',
    'Ottieni 3 vittorie consecutive durante il Paldean Wonders Emblem Event.',
  ),
  createEventEmblem(
    'paldean-wonders-emblem-event-silver-emblema',
    'Paldean Wonders Emblem Event Silver Emblema',
    'paldeanwondersemblemeventsilveremblem',
    'Paldean Wonders Emblem Event',
    'Ottieni 5 vittorie consecutive durante il Paldean Wonders Emblem Event.',
  ),
  createEventEmblem(
    'paldean-wonders-emblem-event-gold-emblema',
    'Paldean Wonders Emblem Event Gold Emblema',
    'paldeanwondersemblemeventgoldemblem',
    'Paldean Wonders Emblem Event',
    'Ottieni 9 vittorie consecutive durante il Paldean Wonders Emblem Event.',
  ),
  createEventEmblem(
    'fantastical-parade-emblem-event-participation-emblema',
    'Fantastical Parade Emblem Event Participation Emblema',
    'fantasticalparadeemblemeventparticipationemblem',
    'Fantastical Parade Emblem Event',
    'Ottieni 1 vittoria durante il Fantastical Parade Emblem Event.',
  ),
  createEventEmblem(
    'fantastical-parade-emblem-event-bronze-emblema',
    'Fantastical Parade Emblem Event Bronze Emblema',
    'fantasticalparadeemblemeventbronzeemblem',
    'Fantastical Parade Emblem Event',
    'Ottieni 3 vittorie consecutive durante il Fantastical Parade Emblem Event.',
  ),
  createEventEmblem(
    'fantastical-parade-emblem-event-silver-emblema',
    'Fantastical Parade Emblem Event Silver Emblema',
    'fantasticalparadeemblemeventsilveremblem',
    'Fantastical Parade Emblem Event',
    'Ottieni 5 vittorie consecutive durante il Fantastical Parade Emblem Event.',
  ),
  createEventEmblem(
    'fantastical-parade-emblem-event-gold-emblema',
    'Fantastical Parade Emblem Event Gold Emblema',
    'fantasticalparadeemblemeventgoldemblem',
    'Fantastical Parade Emblem Event',
    'Ottieni 9 vittorie consecutive durante il Fantastical Parade Emblem Event.',
  ),
  createEventEmblem(
    'crimson-blaze-emblem-event-participation-emblema',
    'Crimson Blaze Emblem Event Participation Emblema',
    'crimsonblazeemblemeventparticipationemblem',
    'Crimson Blaze Emblem Event',
    'Ottieni 1 vittoria durante il Crimson Blaze Emblem Event.',
  ),
  createEventEmblem(
    'crimson-blaze-emblem-event-bronze-emblema',
    'Crimson Blaze Emblem Event Bronze Emblema',
    'crimsonblazeemblemeventbronzeemblem',
    'Crimson Blaze Emblem Event',
    'Ottieni 3 vittorie consecutive durante il Crimson Blaze Emblem Event.',
  ),
  createEventEmblem(
    'crimson-blaze-emblem-event-silver-emblema',
    'Crimson Blaze Emblem Event Silver Emblema',
    'crimsonblazeemblemeventsilveremblem',
    'Crimson Blaze Emblem Event',
    'Ottieni 5 vittorie consecutive durante il Crimson Blaze Emblem Event.',
  ),
  createEventEmblem(
    'crimson-blaze-emblem-event-gold-emblema',
    'Crimson Blaze Emblem Event Gold Emblema',
    'crimsonblazeemblemeventgoldemblem',
    'Crimson Blaze Emblem Event',
    'Ottieni 9 vittorie consecutive durante il Crimson Blaze Emblem Event.',
  ),
  createEventEmblem(
    'mega-rising-emblem-event-participation-emblema',
    'Mega Rising Emblem Event Participation Emblema',
    'megarisingemblemeventparticipationemblem',
    'Mega Rising Emblem Event',
    'Ottieni 1 vittoria durante il Mega Rising Emblem Event.',
  ),
  createEventEmblem(
    'mega-rising-emblem-event-bronze-emblema',
    'Mega Rising Emblem Event Bronze Emblema',
    'megarisingemblemeventbronzeemblem',
    'Mega Rising Emblem Event',
    'Ottieni 3 vittorie consecutive durante il Mega Rising Emblem Event.',
  ),
  createEventEmblem(
    'mega-rising-emblem-event-silver-emblema',
    'Mega Rising Emblem Event Silver Emblema',
    'megarisingemblemeventsilveremblem',
    'Mega Rising Emblem Event',
    'Ottieni 5 vittorie consecutive durante il Mega Rising Emblem Event.',
  ),
  createEventEmblem(
    'mega-rising-emblem-event-gold-emblema',
    'Mega Rising Emblem Event Gold Emblema',
    'megarisingemblemeventgoldemblem',
    'Mega Rising Emblem Event',
    'Ottieni 9 vittorie consecutive durante il Mega Rising Emblem Event.',
  ),
  createEventEmblem(
    'mega-shine-emblem-event-participation-emblema',
    'Mega Shine Emblem Event Participation Emblema',
    'megashineemblemeventparticipationemblem',
    'Mega Shine Emblem Event',
    'Vinci 1 battaglia durante il Mega Shine Emblem Event.',
    serebiiMegaShineEventUrl,
    'Serebii Mega Shine Emblem Event',
    '2026-03-29',
    '2026-04-08',
  ),
  createEventEmblem(
    'mega-shine-emblem-event-bronze-emblema',
    'Mega Shine Emblem Event Bronze Emblema',
    'megashineemblemeventbronzeemblem',
    'Mega Shine Emblem Event',
    'Vinci 3 battaglie durante il Mega Shine Emblem Event.',
    serebiiMegaShineEventUrl,
    'Serebii Mega Shine Emblem Event',
    '2026-03-29',
    '2026-04-08',
  ),
  createEventEmblem(
    'mega-shine-emblem-event-silver-emblema',
    'Mega Shine Emblem Event Silver Emblema',
    'megashineemblemeventsilveremblem',
    'Mega Shine Emblem Event',
    'Vinci 5 battaglie durante il Mega Shine Emblem Event.',
    serebiiMegaShineEventUrl,
    'Serebii Mega Shine Emblem Event',
    '2026-03-29',
    '2026-04-08',
  ),
  createEventEmblem(
    'mega-shine-emblem-event-gold-emblema',
    'Mega Shine Emblem Event Gold Emblema',
    'megashineemblemeventgoldemblem',
    'Mega Shine Emblem Event',
    'Vinci 9 battaglie durante il Mega Shine Emblem Event.',
    serebiiMegaShineEventUrl,
    'Serebii Mega Shine Emblem Event',
    '2026-03-29',
    '2026-04-08',
  ),
]

export const rewardOverrides: RewardGuide[] = [
  ...shopEmblems,
  ...collectionEmblems,
  ...setCompletionEmblems,
  ...pulsingAuraEmblems,
  ...secretMissionEmblems,
  ...celebrationEmblems,
  ...eventEmblems,
  ...eventIcons,
]
