import { Link } from 'react-router-dom'
import { SetVisual } from '../components/SetVisual'
import { useCatalog } from '../hooks/useCatalog'
import { usePageMeta } from '../hooks/usePageMeta'
import { compareCatalogDatesDesc, formatCatalogDate } from '../lib/catalog'

export function ExpansionsPage() {
  usePageMeta({
    title: 'Espansioni Pokemon Pocket | Pocket Hub',
    description:
      'Consulta tutte le espansioni di Pokemon Pocket e apri ogni set con le carte collegate.',
  })
  const { catalog, loading, error } = useCatalog()
  const sets = catalog?.sets ?? []

  return (
    <div className="page-shell">
      <main className="cards-page">
        <section className="section-intro">
          <div>
            <p className="section-kicker">Espansioni</p>
            <h1>Tutte le espansioni in una sezione dedicata.</h1>
          </div>
          <p className="section-note section-note-inline">
            Ogni espansione ha una pagina con tutte le carte collegate.
          </p>
        </section>

        <section className="decks-section">
          {loading ? (
            <article className="empty-state">
              <h3>Sto caricando le espansioni</h3>
              <p>Recupero il catalogo persistente del sito.</p>
            </article>
          ) : error ? (
            <article className="empty-state">
              <h3>Errore nel caricamento</h3>
              <p>{error}</p>
            </article>
          ) : (
            <div className="expansion-directory-grid">
              {sets
                .slice()
                .sort((left, right) => compareCatalogDatesDesc(left.releaseDate, right.releaseDate))
                .map((set) => (
                  <Link
                    key={set.id}
                    to={`/espansioni/${set.id}`}
                    className="expansion-directory-card"
                    aria-label={`Apri l'espansione ${set.name}`}
                  >
                    <div className="expansion-visual expansion-visual-large expansion-visual-card-shell">
                      <SetVisual set={set} size="large" />
                    </div>
                    <p>{set.id}</p>
                    <h3>{set.name}</h3>
                    <span>{formatCatalogDate(set.releaseDate)}</span>
                    <small>{set.totalCardCount} carte</small>
                  </Link>
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
