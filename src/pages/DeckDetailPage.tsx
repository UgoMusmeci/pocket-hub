import { Link, useParams } from 'react-router-dom'
import { HoverCardLink } from '../components/HoverCardLink'
import { metaDecks, metaDeckSnapshot } from '../data/metaDecks'
import { missionDecks } from '../data/missionDecks'
import { useCatalog } from '../hooks/useCatalog'
import { usePageMeta } from '../hooks/usePageMeta'
import { getCardImageUrl, handleCardImageError, localizeCardName } from '../lib/catalog'
import { findCatalogCard, getDeckBySlug, getDeckCardTotal, getMetaDeckBySlug } from '../lib/decks'
import type { CatalogCard } from '../types/catalog'

export function DeckDetailPage() {
  const { slug } = useParams()
  const { catalog, loading, error } = useCatalog()
  const directDeck = slug ? getDeckBySlug(slug) : undefined
  const metaDeck = !directDeck && slug ? getMetaDeckBySlug(slug) : undefined
  const referenceDeck = metaDeck ? getDeckBySlug(metaDeck.referenceDeckSlug) : undefined
  const deck = directDeck ?? referenceDeck
  const displayDeck =
    metaDeck && deck
      ? {
          ...deck,
          representativePokemon: metaDeck.representativePokemon,
        }
      : deck
  const cards = catalog?.cards ?? []
  const metaReference = metaDeck ?? (deck ? metaDecks.find((entry) => entry.referenceDeckSlug === deck.slug) : undefined)
  const missionReference = deck ? missionDecks.find((entry) => entry.relatedGuideSlug === deck.slug) : undefined
  const isCompetitive = Boolean(metaDeck || metaReference)
  const isMissionGuide = !isCompetitive && Boolean(missionReference)
  const pageTitle = metaDeck?.archetype ?? deck?.name
  const pageEyebrow = isCompetitive ? 'Mazzo competitivo' : isMissionGuide ? 'Guida pratica per missioni' : 'Guida mazzo'
  const pageDescription = isCompetitive
    ? 'Lista di riferimento per leggere il core dell archetipo e capire subito perché questo mazzo sta funzionando nel competitivo.'
    : isMissionGuide
      ? 'Una guida rapida e concreta, utile per chi vuole un mazzo solido da usare contro la CPU e nelle missioni ricorrenti.'
      : 'Una guida sintetica per capire la struttura del mazzo, le carte chiave e il suo piano di gioco.'

  usePageMeta({
    title: pageTitle ? `${pageTitle} | Mazzo Pokemon Pocket | Pocket Hub` : 'Mazzo Pokemon Pocket | Pocket Hub',
    description: pageDescription,
  })

  return (
    <div className="page-shell detail-shell">
      <main className="detail-page">
        <Link to="/mazzi" className="back-link">
          Torna ai mazzi
        </Link>

        {!deck || !displayDeck ? (
          <article className="empty-state">
            <h3>Mazzo non trovato</h3>
            <p>Apri la sezione mazzi e scegli una lista disponibile.</p>
          </article>
        ) : loading ? (
          <article className="empty-state">
            <h3>Sto caricando il mazzo</h3>
            <p>Recupero catalogo e miniature delle carte.</p>
          </article>
        ) : error ? (
          <article className="empty-state">
            <h3>Errore nel caricamento</h3>
            <p>{error}</p>
          </article>
        ) : (
          <>
            <section className="deck-detail-hero">
              <div className="deck-detail-cover">
                <div className="deck-hero-sprites">
                  <img
                    className="deck-hero-sprite"
                    src={displayDeck.representativePokemon.sprite}
                    alt={displayDeck.representativePokemon.name}
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="detail-copy deck-detail-copy">
                <p className="eyebrow">{pageEyebrow}</p>
                <h1>{pageTitle}</h1>
                <p className="detail-summary">{pageDescription}</p>

                <div className="detail-stats deck-detail-stats-compact">
                  {isCompetitive ? (
                    <>
                      <article className="summary-card">
                        <p>Meta</p>
                        <strong>{metaReference ? `Top ${metaReference.rank}` : displayDeck.tier}</strong>
                        <small>{displayDeck.playStyle}</small>
                      </article>
                      <article className="summary-card">
                        <p>Winrate</p>
                        <strong>{metaReference ? `${metaReference.winRate.toFixed(2)}%` : 'n/d'}</strong>
                        <small>{metaReference ? `${metaReference.deckCount} liste tracciate` : 'Dati in aggiornamento'}</small>
                      </article>
                      <article className="summary-card">
                        <p>Presenza</p>
                        <strong>{metaReference ? `${metaReference.share.toFixed(2)}%` : 'n/d'}</strong>
                        <small>{metaReference ? 'Presenza nel meta attuale' : 'Dati in aggiornamento'}</small>
                      </article>
                      <article className="summary-card">
                        <p>Composizione</p>
                        <strong>{getDeckCardTotal(displayDeck)}/20 carte</strong>
                        <small>Lista guida dell archetipo</small>
                      </article>
                    </>
                  ) : (
                    <>
                      <article className="summary-card">
                        <p>Uso ideale</p>
                        <strong>{isMissionGuide ? 'CPU e missioni' : displayDeck.bestFor}</strong>
                        <small>{displayDeck.playStyle}</small>
                      </article>
                      <article className="summary-card">
                        <p>Difficoltà</p>
                        <strong>{displayDeck.difficulty}</strong>
                        <small>{displayDeck.bestFor}</small>
                      </article>
                      <article className="summary-card">
                        <p>Composizione</p>
                        <strong>{getDeckCardTotal(displayDeck)}/20 carte</strong>
                        <small>{displayDeck.updatedAt}</small>
                      </article>
                      <article className="summary-card">
                        <p>Carta chiave</p>
                        <strong>{localizeCardName(displayDeck.representativeCard)}</strong>
                        <small>{displayDeck.representativePokemon.name}</small>
                      </article>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="detail-grid deck-detail-grid">
              <article className="detail-panel deck-list-panel">
                <div className="deck-list-header">
                  <div>
                    <h2>Lista completa del mazzo</h2>
                    <p className="deck-list-intro">
                      Le carte che compongono il mazzo sono il cuore della pagina. Tocca una carta per aprire il suo dettaglio.
                    </p>
                  </div>
                  <div className="deck-list-badge">
                    <strong>{getDeckCardTotal(displayDeck)}/20</strong>
                    <span>carte</span>
                  </div>
                </div>
                <div className="deck-composition-grid">
                  {displayDeck.cards.map((entry) => {
                    const card = findCatalogCard(cards, entry)

                    if (!card) {
                      return (
                        <article
                          key={`${displayDeck.slug}-${entry.name}`}
                          className="deck-composition-card"
                        >
                          <div className="deck-card-thumb deck-card-thumb-empty">
                            <div className="deck-card-thumb-fallback">
                              {localizeCardName(entry.name).slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div className="deck-card-copy">
                            <strong>{localizeCardName(entry.name)}</strong>
                            <span>x{entry.count}</span>
                          </div>
                        </article>
                      )
                    }

                    return (
                      <DeckCardLink
                        key={`${displayDeck.slug}-${entry.name}`}
                        card={card}
                        count={entry.count}
                      />
                    )
                  })}
                </div>
              </article>

              <article className="detail-panel deck-side-panel">
                <h2>{isCompetitive ? 'Lettura rapida del mazzo' : 'Profilo rapido'}</h2>
                <ul className="detail-list">
                  <li>Pokemon simbolo: {displayDeck.representativePokemon.name}</li>
                  <li>Carta simbolo: {localizeCardName(displayDeck.representativeCard)}</li>
                  <li>Stile di gioco: {displayDeck.playStyle}</li>
                  <li>Ideale per: {displayDeck.bestFor}</li>
                  <li>Aggiornato al: {displayDeck.updatedAt}</li>
                </ul>

                {isCompetitive && metaReference ? (
                  <div className="deck-note-panel">
                    <h3>Statistiche competitive</h3>
                    <ul className="detail-list">
                      <li>Archetipo di riferimento: {metaReference.archetype}</li>
                      <li>Presenza nel meta: {metaReference.share.toFixed(2)}%</li>
                      <li>Winrate: {metaReference.winRate.toFixed(2)}%</li>
                      <li>Campione: {metaReference.deckCount} liste su {metaDeckSnapshot.tournaments} tornei</li>
                    </ul>
                  </div>
                ) : null}

                {isMissionGuide && missionReference ? (
                  <div className="deck-note-panel">
                    <h3>Perché funziona bene in PvE</h3>
                    <ul className="detail-list">
                      <li>{missionReference.goal}</li>
                      {missionReference.strengths.map((strength) => (
                        <li key={strength}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="deck-side-copy">
                  <h3>{isCompetitive ? 'In sintesi' : 'Piano del mazzo'}</h3>
                  <p className="deck-strategy">
                    {isCompetitive
                      ? 'Un archetipo da leggere per core, pressione e matchup: qui trovi la struttura essenziale da cui partire per capire il mazzo.'
                      : displayDeck.strategy}
                  </p>
                </div>

                <div className="deck-strength-grid">
                  <div className="deck-note-panel">
                    <h3>Punti forti</h3>
                    <ul className="detail-list">
                      {displayDeck.strengths.map((strength) => (
                        <li key={strength}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="deck-note-panel">
                    <h3>Punti deboli</h3>
                    <ul className="detail-list">
                      {displayDeck.weaknesses.map((weakness) => (
                        <li key={weakness}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

type DeckCardLinkProps = {
  card: CatalogCard
  count: number
}

function DeckCardLink({ card, count }: DeckCardLinkProps) {
  const imageUrl = getCardImageUrl(card)
  const cardName = localizeCardName(card.name)

  return (
    <HoverCardLink
      to={`/carte/${card.id}`}
      className="deck-composition-card deck-composition-link"
      card={card}
    >
      <div className={`deck-card-thumb ${imageUrl ? '' : 'deck-card-thumb-empty'}`.trim()}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={cardName}
            loading="lazy"
            onError={(event) => {
              handleCardImageError(event.currentTarget, 'deck-card-thumb-empty')
            }}
          />
        ) : null}
        <div className="deck-card-thumb-fallback" aria-hidden={Boolean(imageUrl)}>
          {cardName.slice(0, 2).toUpperCase()}
        </div>
      </div>
      <div className="deck-card-copy">
        <strong>{cardName}</strong>
        <span>x{count}</span>
      </div>
    </HoverCardLink>
  )
}
