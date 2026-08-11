export type { DeckCardEntry, DeckIdea } from './deckTypes'
import { deckSet1 } from './deckSet1'
import { deckSet2 } from './deckSet2'
import { deckSet3 } from './deckSet3'
import { deckSet4 } from './deckSet4'
import { deckSet5 } from './deckSet5'
import { experimentalDecks } from './experimentalDecks'

export const allDeckIdeas = [
  ...deckSet1,
  ...deckSet2,
  ...deckSet3,
  ...deckSet4,
  ...deckSet5,
  ...experimentalDecks,
]

export const deckIdeas = [
  deckSet5[2],
  deckSet4[0],
  deckSet1[1],
  deckSet2[1],
  deckSet5[0],
  deckSet2[3],
  deckSet3[0],
  deckSet5[4],
  deckSet1[3],
  deckSet1[2],
  deckSet3[2],
  deckSet5[1],
]

export { experimentalDecks }
