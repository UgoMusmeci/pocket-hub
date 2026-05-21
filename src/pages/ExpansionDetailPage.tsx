import { Link, useParams } from 'react-router-dom'
import { CardTile } from '../components/CardTile'
import { SetVisual } from '../components/SetVisual'
import { useCatalog } from '../hooks/useCatalog'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatCatalogDate } from '../lib/catalog'

export function ExpansionDetailPage() {
  const { setId } = useParams()
  const { catalog, loading, error } = useCatalog()

  const set = catalog?.sets.find((entry) => entry.id === setId)
  const cards = catalog?.cards.filter((entry) => entry.setId === setId) ?? []
  const setName = set?.name ?? 'Espansione Pokemon Pocket'

  usePageMeta({
    title: set ? `${set.name} | Espansione Pokemon Pocket | Pocket Hub` : 'Espansione Pokemon Pocket | Pocket Hub',
    description: set
      ? `Scopri ${set.name}: data di uscita, numero di carte e archivio completo delle carte del set.`
      : 'Apri una espansione di Pokemon Pocket e consulta tutte le carte collegate.',
  })

  return (
    <div className="page-shell detail-shell">
      <main className="detail-page">
        <Link to="/espansioni" className="back-link">
          Torna alle espansioni
        </Link>

        {loading ? (
          <article className="empty-state">
            <h3>Sto caricando l&apos;espansione</h3>
            <p>Recupero i dati del set e le carte collegate.</p>
          </article>
        ) : error ? (
          <article className="empty-state">
            <h3>Errore nel caricamento</h3>
            <p>{error}</p>
          </article>
        ) : !set ? (
          <article className="empty-state">
            <h3>Espansione non trovata</h3>
            <p>Controlla l&apos;URL oppure torna alla lista completa delle espansioni.</p>
          </article>
        ) : (
          <>
            <section className="expansion-hero">
              <div className="detail-copy expansion-copy">
                <div className="expansion-detail-visual expansion-visual-card-shell">
                  <SetVisual set={set} size="detail" />
                </div>
                <p className="eyebrow">Espansione</p>
                <h1>{set.name}</h1>
                <p className="detail-summary">
                  {set.id} - {formatCatalogDate(set.releaseDate)} - {set.totalCardCount} carte
                </p>

                <div className="detail-stats">
                  <article className="summary-card">
                    <p>Set</p>
                    <strong>{set.id}</strong>
                    <small>Codice espansione</small>
                  </article>
                  <article className="summary-card">
                    <p>Carte ufficiali</p>
                    <strong>{set.officialCardCount}</strong>
                    <small>Conteggio dichiarato</small>
                  </article>
                  <article className="summary-card">
                    <p>Carte in archivio</p>
                    <strong>{cards.length}</strong>
                    <small>Disponibili nel sito</small>
                  </article>
                </div>
              </div>
            </section>

            <section className="archive-section">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">Carte del set</p>
                  <h2>Tutte le carte di {setName}.</h2>
                </div>
                <p className="section-note">{cards.length} carte collegate a questa espansione</p>
              </div>

              <div className="card-grid card-grid-dense">
                {cards.map((card) => (
                  <CardTile key={card.id} card={card} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
