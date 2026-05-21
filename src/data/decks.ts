export type { DeckCardEntry, DeckIdea } from './deckTypes'
import { deckSet1 } from './deckSet1'
import { deckSet2 } from './deckSet2'
import { deckSet3 } from './deckSet3'
import { deckSet4 } from './deckSet4'
import { deckSet5 } from './deckSet5'

export const allDeckIdeas = [
  ...deckSet1,
  ...deckSet2,
  ...deckSet3,
  ...deckSet4,
  ...deckSet5,
]

export const deckIdeas = [
  ...deckSet1,
  deckSet5[0],
  deckSet5[1],
  deckSet5[2],
  deckSet2[1],
  deckSet2[2],
  deckSet3[0],
  deckSet3[3],
  deckSet4[0],
  deckSet4[2],
  deckSet5[3],
  deckSet5[4],
]
