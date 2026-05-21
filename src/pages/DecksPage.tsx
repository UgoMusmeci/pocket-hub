import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { missionDecks } from '../data/missionDecks'
import { metaDecks, metaDeckSnapshot } from '../data/metaDecks'
import { usePageMeta } from '../hooks/usePageMeta'
import { getDeckCardTotal, getDeckIdeasSortedByRecent } from '../lib/decks'
import { localizeCardName } from '../lib/catalog'

export function DecksPage() {
  usePageMeta({
    title: 'Mazzi Pokemon Pocket | Pocket Hub',
    description:
      'Scopri mazzi competitivi, liste per missioni e guide editoriali complete da 20 carte per Pokemon Pocket.',
  })

  const decks = getDeckIdeasSortedByRecent()
  const [sortBy, setSortBy] = useState<'winrate' | 'share'>('winrate')

  const competitiveDecks = useMemo(() => {
    const ordered = [...metaDecks]

    ordered.sort((left, right) => {
      if (sortBy === 'winrate') {
        return right.winRate - left.winRate || right.share - left.share
      }

      return right.share - left.share || right.winRate - left.winRate
    })

    return ordered
  }, [sortBy])

  return (
    <div className="page-shell">
      <main className="cards-page">
        <section className="section-intro">
          <div>
            <p className="section-kicker">Mazzi</p>
            <h1>Mazzi competitivi e guide complete da consultare in un attimo.</h1>
          </div>
          <p className="section-note section-note-inline">
            Una pagina divisa tra meta competitivo, mazzi utili per missioni o CPU e la nostra
            rubrica editoriale.
          </p>
        </section>

        <section className="decks-section meta-overview-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Meta competitivo</p>
              <h2>I mazzi che stanno girando meglio nel competitivo.</h2>
              <p className="meta-updated-note">
                Aggiornato al <strong>{metaDeckSnapshot.generatedAtLabel}</strong>
              </p>
            </div>
            <label className="input-group meta-sort-group">
              <span>Ordina per</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'winrate' | 'share')}
              >
                <option value="winrate">Winrate</option>
                <option value="share">Presenza nel meta</option>
              </select>
            </label>
          </div>

          <p className="meta-section-note">
            Questa sezione viene aggiornata con continuità per offrirti uno specchio rapido del
            meta, basato sugli archetipi competitivi più rilevanti che hanno già una guida
            consultabile nel portale.
          </p>

          <div className="meta-rank-grid">
            {competitiveDecks.map((entry) => (
              <Link key={entry.slug} to={`/mazzi/${entry.slug}`} className="meta-rank-card meta-rank-card-link">
                <div className="meta-rank-topline">
                  <span className="meta-rank-badge">#{entry.rank}</span>
                  <span>{entry.deckCount} liste</span>
                </div>
                <div className="meta-rank-sprites">
                  <img
                    className="meta-rank-sprite"
                    src={entry.representativePokemon.sprite}
                    alt={entry.representativePokemon.name}
                    loading="lazy"
                  />
                </div>
                <h3>{entry.archetype}</h3>
                <div className="meta-rank-stats">
                  <div>
                    <small>Presenza</small>
                    <strong>{entry.share.toFixed(2)}%</strong>
                  </div>
                  <div>
                    <small>Winrate</small>
                    <strong>{entry.winRate.toFixed(2)}%</strong>
                  </div>
                </div>
                <span className="meta-rank-hint">Scheda meta consultabile</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="decks-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Missioni e CPU</p>
              <h2>Mazzi consigliati per completare ricompense e partite PvE.</h2>
            </div>
            <p className="section-note">
              Una selezione più pratica: liste pensate per fare missioni, farmare premi e giocare
              contro la CPU con meno attrito.
            </p>
          </div>

          <div className="mission-grid">
            {missionDecks.map((deck) => (
              <Link
                key={deck.slug}
                to={deck.relatedGuideSlug ? `/mazzi/${deck.relatedGuideSlug}` : '/mazzi'}
                className="mission-card mission-card-link"
                aria-label={`Apri il mazzo ${deck.name}`}
              >
                <div className="deck-directory-top">
                  <div>
                    <p className="section-kicker">{deck.goal}</p>
                    <h3>{deck.name}</h3>
                  </div>
                  <div className="deck-directory-sprite-stack">
                    <img
                      className="deck-directory-sprite"
                      src={deck.representativePokemon.sprite}
                      alt={deck.representativePokemon.name}
                      loading="lazy"
                    />
                  </div>
                </div>
                <p>{deck.description}</p>
                <ul className="tag-list" aria-label={`Punti forti ${deck.name}`}>
                  {deck.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </section>

        <section className="decks-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Rubrica del portale</p>
              <h2>Le nostre liste complete da 20 carte.</h2>
            </div>
            <p className="section-note">
              Questa parte è editoriale: scegliamo noi quali mazzi raccontare, spiegare e
              approfondire nel dettaglio.
            </p>
          </div>

          <div className="deck-directory-grid">
            {decks.map((deck) => (
              <Link
                key={deck.slug}
                to={`/mazzi/${deck.slug}`}
                className="deck-directory-card deck-directory-card-link"
                aria-label={`Apri il mazzo ${deck.name}`}
              >
                <div className="deck-directory-top">
                  <div>
                    <div className="deck-topline">
                      <span>{deck.tier}</span>
                      <span>{deck.playStyle}</span>
                    </div>
                    <h3>{deck.name}</h3>
                  </div>
                  <div className="deck-directory-sprite-stack">
                    <img
                      className="deck-directory-sprite"
                      src={deck.representativePokemon.sprite}
                      alt={deck.representativePokemon.name}
                      loading="lazy"
                    />
                  </div>
                </div>
                <p>{deck.description}</p>
                <ul className="tag-list" aria-label={`Profilo ${deck.name}`}>
                  <li>Difficoltà: {deck.difficulty}</li>
                  <li>{getDeckCardTotal(deck)}/20 carte</li>
                  <li>Carta simbolo: {localizeCardName(deck.representativeCard)}</li>
                </ul>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
