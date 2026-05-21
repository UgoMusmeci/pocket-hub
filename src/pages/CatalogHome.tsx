import { Link } from 'react-router-dom'
import { SetVisual } from '../components/SetVisual'
import { useCatalog } from '../hooks/useCatalog'
import {
  compareCatalogDatesDesc,
  formatCatalogDate,
  getCardImageUrl,
  localizeCardName,
} from '../lib/catalog'
import { getFeaturedDeckIdeas, getDeckCardTotal, getDeckIdeasSortedByRecent } from '../lib/decks'

export function CatalogHome() {
  const { catalog, loading } = useCatalog()
  const sets = catalog?.sets ?? []
  const featuredSets = sets
    .slice()
    .sort((left, right) => compareCatalogDatesDesc(left.releaseDate, right.releaseDate))
    .slice(0, 3)
  const featuredDecks = getFeaturedDeckIdeas(3)
  const allDecks = getDeckIdeasSortedByRecent()
  const spotlightCard =
    catalog?.cards.find((card) => card.suffix === 'EX' && getCardImageUrl(card)) ??
    catalog?.cards.find((card) => getCardImageUrl(card))
  const spotlightSet = featuredSets[0]
  const spotlightDeck = featuredDecks[0]
  return (
    <div className="page-shell">
      <header className="hero-section home-hero">
        <div className="hero-copy hero-copy-home">
          <div>
            <p className="eyebrow">Archivio Pokemon Pocket</p>
            <h1>Tutto quello che ti serve per trovare carte e scoprire mazzi Pokemon Pocket.</h1>
            <p className="hero-text">
              Consulta l archivio completo, sfoglia le espansioni e trova idee per i tuoi
              prossimi mazzi in un unico posto.
            </p>
          </div>

          <div>
            <div className="hero-actions">
              <Link to="/carte" className="primary-action">
                Cerca una carta
              </Link>
              <Link to="/mazzi" className="secondary-action">
                Guarda i mazzi
              </Link>
            </div>

            <div className="home-stat-row" aria-label="Numeri principali del sito">
              <article className="home-stat">
                <span>Carte</span>
                <strong>{loading ? '...' : catalog?.metadata.cardCount ?? 0}</strong>
              </article>
              <article className="home-stat">
                <span>Espansioni</span>
                <strong>{loading ? '...' : catalog?.metadata.setCount ?? 0}</strong>
              </article>
              <article className="home-stat">
                <span>Mazzi</span>
                <strong>{allDecks.length}</strong>
              </article>
            </div>
          </div>
        </div>

        <div className="hero-showcase" aria-label="Punti chiave del sito">
          <div className="showcase-orbit orbit-one"></div>
          <div className="showcase-orbit orbit-two"></div>

          <article className="showcase-card showcase-card-1">
            <p>Carte</p>
            <strong>Trovale in un attimo</strong>
            <span>Cerca per nome, tipo, rarita ed espansione.</span>
          </article>

          <article className="showcase-card showcase-card-2">
            <p>Mazzi</p>
            <strong>Scopri nuove idee</strong>
            <span>Liste complete da 20 carte con pagina dedicata.</span>
          </article>

          <article className="showcase-card showcase-card-3">
            <p>Espansioni</p>
            <strong>Segui ogni set</strong>
            <span>Ogni espansione ha una pagina con tutte le carte collegate.</span>
          </article>

          <div className="showcase-core">
            <span>Pokemon Pocket</span>
            <strong>Carte e mazzi</strong>
            <small>Archivio completo e consultazione veloce</small>
          </div>
        </div>
      </header>

      <main>
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Accesso rapido</p>
              <h2>Scegli da dove iniziare.</h2>
            </div>
          </div>

          <div className="home-shortcuts-grid">
            <Link to="/carte" className="home-shortcut-card home-shortcut-card-cards">
              <div className="home-shortcut-visual">
                {spotlightCard ? (
                  <img
                    className="home-shortcut-card-art"
                    src={getCardImageUrl(spotlightCard) ?? undefined}
                    alt={localizeCardName(spotlightCard.name)}
                    loading="lazy"
                  />
                ) : (
                  <div className="home-shortcut-fallback-mark">Carte</div>
                )}
                <div className="shortcut-glow shortcut-glow-cards"></div>
              </div>
              <p>Carte</p>
              <h3>Esplora l archivio</h3>
              <span>Trova subito la carta che ti serve e apri la sua scheda completa.</span>
              <small>Ricerca veloce, filtri e pagine dedicate per ogni carta.</small>
            </Link>

            <Link to="/espansioni" className="home-shortcut-card home-shortcut-card-sets">
              <div className="home-shortcut-visual">
                {spotlightSet ? (
                  <SetVisual set={spotlightSet} />
                ) : (
                  <div className="home-shortcut-fallback-mark">Set</div>
                )}
                <div className="shortcut-glow shortcut-glow-sets"></div>
              </div>
              <p>Espansioni</p>
              <h3>Scopri i set</h3>
              <span>Consulta le uscite piu recenti e naviga tutte le carte di ogni espansione.</span>
              <small>Dalle ultime novita alle promo, tutto ordinato in un solo posto.</small>
            </Link>

            <Link to="/mazzi" className="home-shortcut-card home-shortcut-card-decks">
              <div className="home-shortcut-visual">
                {spotlightDeck ? (
                  <div className="home-shortcut-sprite-pair">
                    <img
                      className="home-shortcut-sprite"
                      src={spotlightDeck.representativePokemon.sprite}
                      alt={spotlightDeck.representativePokemon.name}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="home-shortcut-fallback-mark">Deck</div>
                )}
                <div className="shortcut-glow shortcut-glow-decks"></div>
              </div>
              <p>Mazzi</p>
              <h3>Prendi ispirazione</h3>
              <span>Guarda liste complete, strategie e carte chiave dei mazzi consigliati.</span>
              <small>Trova subito un archetipo adatto al tuo stile di gioco.</small>
            </Link>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Espansioni in evidenza</p>
              <h2>Le ultime uscite da tenere d occhio.</h2>
            </div>
          </div>

          <section className="summary-grid" aria-label="Espansioni recenti">
            {featuredSets.map((set) => {
              return (
                <Link
                  key={set.id}
                  to={`/espansioni/${set.id}`}
                  className="summary-card summary-card-link"
                >
                  <div className="expansion-visual expansion-visual-card-shell">
                    <SetVisual set={set} />
                  </div>
                  <p>{set.id}</p>
                  <strong>{set.name}</strong>
                  <span>{formatCatalogDate(set.releaseDate)}</span>
                  <small>{set.totalCardCount} carte totali</small>
                </Link>
              )
            })}
          </section>
        </section>

        <section className="decks-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Mazzi in evidenza</p>
              <h2>Tre proposte da vedere subito.</h2>
            </div>
          </div>

          <div className="deck-preview-grid">
            {featuredDecks.map((deck) => (
              <Link
                key={deck.slug}
                to={`/mazzi/${deck.slug}`}
                className="deck-preview-card deck-preview-card-link"
                aria-label={`Apri il mazzo ${deck.name}`}
              >
                <div className="deck-preview-head">
                  <div className="deck-preview-sprite-stack">
                    <img
                      className="deck-preview-sprite"
                      src={deck.representativePokemon.sprite}
                      alt={deck.representativePokemon.name}
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="deck-topline">
                      <span>{deck.tier}</span>
                      <span>{deck.playStyle}</span>
                    </div>
                    <h3>{deck.name}</h3>
                  </div>
                </div>

                <p>{deck.description}</p>

                <ul className="tag-list" aria-label={`Sintesi ${deck.name}`}>
                  <li>{getDeckCardTotal(deck)}/20 carte</li>
                  <li>{deck.updatedAt}</li>
                  <li>{localizeCardName(deck.representativeCard)}</li>
                </ul>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-block home-value-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Perche tornare qui</p>
              <h2>Un sito pensato per essere davvero utile.</h2>
            </div>
          </div>

          <div className="home-value-grid">
            <article className="quick-panel home-value-card">
              <h3>Trovi le carte in fretta</h3>
              <p>
                L archivio e organizzato per aiutarti a trovare subito quello che cerchi, senza perderti.
              </p>
            </article>

            <article className="quick-panel home-value-card">
              <h3>I mazzi sono facili da consultare</h3>
              <p>
                Ogni mazzo ha la sua pagina, la composizione completa e collegamenti alle carte che lo compongono.
              </p>
            </article>

            <article className="quick-panel home-value-card">
              <h3>Tutto e collegato meglio</h3>
              <p>
                Carte, espansioni e mazzi parlano tra loro, cosi puoi passare da una sezione all altra in modo naturale.
              </p>
            </article>
          </div>
        </section>

        <section className="section-block home-updates-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Presto disponibile</p>
              <h2>Le prossime funzioni in arrivo.</h2>
            </div>
          </div>

          <div className="home-updates-grid">
            <article className="home-update-card home-future-card">
              <strong>Deck Builder</strong>
              <p>Crea i tuoi mazzi carta per carta, salvali e confronta diverse versioni dello stesso archetipo.</p>
            </article>
            <article className="home-update-card home-future-card">
              <strong>Scambi</strong>
              <p>Pubblica inserzioni per trovare carte mancanti, proporre scambi e organizzare trattative in modo semplice.</p>
            </article>
            <article className="home-update-card home-future-card">
              <strong>Area personale</strong>
              <p>Gestisci i mazzi preferiti, tieni d occhio la collezione e segui più facilmente le novità che ti interessano.</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}
