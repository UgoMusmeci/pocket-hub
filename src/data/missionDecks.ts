import { artwork } from './deckTypes'

export type MissionDeckIdea = {
  slug: string
  name: string
  goal: string
  description: string
  strengths: string[]
  representativePokemon: {
    name: string
    sprite: string
  }
  secondaryPokemon: {
    name: string
    sprite: string
  }
  relatedGuideSlug?: string
}

export const missionDecks: MissionDeckIdea[] = [
  {
    slug: 'missioni-pressione-rapida',
    name: 'Pressione rapida',
    goal: 'Per farmare missioni veloci contro la CPU',
    description:
      'Una base aggressiva pensata per chiudere in fretta le partite facili e accumulare ricompense senza perdere tempo.',
    strengths: ['Partenze rapide', 'Turni semplici da pilotare', 'Ottimo per sessioni brevi'],
    representativePokemon: { name: 'Bellibolt', sprite: artwork(939) },
    secondaryPokemon: { name: 'Zeraora', sprite: artwork(807) },
    relatedGuideSlug: 'bellibolt-ex-magnezone',
  },
  {
    slug: 'missioni-stabile-acqua',
    name: 'Acqua stabile',
    goal: 'Per vincere con costanza negli incontri CPU più lunghi',
    description:
      'Una proposta più regolare, utile quando vuoi una lista affidabile che tenga bene il ritmo e non dipenda da aperture perfette.',
    strengths: ['Molto costante', 'Gestione più sicura degli scambi', 'Buono per missioni ripetute'],
    representativePokemon: { name: 'Suicune', sprite: artwork(245) },
    secondaryPokemon: { name: 'Greninja', sprite: artwork(658) },
    relatedGuideSlug: 'greninja-ex-suicune-ex',
  },
  {
    slug: 'missioni-fuoco-impatto',
    name: 'Fuoco d impatto',
    goal: 'Per missioni che chiedono KO rapidi o danni alti',
    description:
      'Un archetipo spettacolare e diretto, comodo quando la missione premia la pressione offensiva o i KO in pochi turni.',
    strengths: ['Danni alti', 'Chiusure veloci', 'Facile da adattare alle missioni evento'],
    representativePokemon: { name: 'Charizard', sprite: artwork(6) },
    secondaryPokemon: { name: 'Entei', sprite: artwork(244) },
    relatedGuideSlug: 'mega-charizard-ex-entei-ex',
  },
  {
    slug: 'missioni-linea-semplice',
    name: 'Linea semplice',
    goal: 'Per chi vuole un mazzo CPU facile da usare e da migliorare',
    description:
      'Una soluzione accessibile per fare pratica, completare missioni giornaliere e avere una base chiara da cui partire.',
    strengths: ['Pilotaggio intuitivo', 'Buon punto di ingresso', 'Poche linee complesse'],
    representativePokemon: { name: 'Scizor', sprite: artwork(212) },
    secondaryPokemon: { name: 'Skarmory', sprite: artwork(227) },
    relatedGuideSlug: 'mega-scizor-ex-skarmory',
  },
]
