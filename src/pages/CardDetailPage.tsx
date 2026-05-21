import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  getCardImageUrl,
  getPrimaryType,
  localizeCardName,
  localizeCategory,
  localizeRarity,
  localizeStage,
  localizeSuffix,
  localizeTypes,
} from '../lib/catalog'

export function CardDetailPage() {
  const { cardId } = useParams()
  const { catalog, loading, error } = useCatalog()

  const card = catalog?.cards.find((entry) => entry.id === cardId)
  const set = catalog?.sets.find((entry) => entry.id === card?.setId)
  const primaryType = card ? getPrimaryType(card).toLowerCase() : 'pokemon'
  const localizedTypes = card ? localizeTypes(card.types) : []
  const categoryLabel = card ? localizeCategory(card.category) : ''
  const imageUrl = card ? getCardImageUrl(card) : null
  const isPokemonCard = card?.category === 'Pokemon'

  usePageMeta({
    title: card
      ? `${localizeCardName(card.name)} | Carta Pokemon Pocket | Pocket Hub`
      : 'Carta Pokemon Pocket | Pocket Hub',
    description: card
      ? `Scheda completa di ${localizeCardName(card.name)} con rarità, tipo, set, attacchi e dettagli principali.`
      : 'Apri la scheda completa di una carta di Pokemon Pocket.',
  })

  return (
    <div className="page-shell detail-shell">
      <main className="detail-page">
        <Link to="/carte" className="back-link">
          Torna alle carte
        </Link>

        {loading ? (
          <article className="empty-state">
            <h3>Sto caricando la carta</h3>
            <p>Recupero i dati dal catalogo persistente locale.</p>
          </article>
        ) : error ? (
          <article className="empty-state">
            <h3>Errore nel caricamento</h3>
            <p>{error}</p>
          </article>
        ) : !card ? (
          <article className="empty-state">
            <h3>Carta non trovata</h3>
            <p>Controlla l'URL oppure torna all'archivio per selezionarla di nuovo.</p>
          </article>
        ) : (
          <>
            <section className="detail-hero">
              <div className={`detail-art type-${primaryType} ${imageUrl ? '' : 'detail-art-empty'}`.trim()}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={localizeCardName(card.name)}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.parentElement?.classList.add('detail-art-empty')
                      event.currentTarget.remove()
                    }}
                  />
                ) : null}
                <div className="detail-art-fallback" aria-hidden={Boolean(imageUrl)}>
                  <span>
                    {card.setId} #{card.localId}
                  </span>
                  <strong>{localizeCardName(card.name)}</strong>
                  <small>{localizedTypes.join(', ') || categoryLabel}</small>
                </div>
              </div>

              <div className="detail-copy">
                <p className="eyebrow">
                  {card.setId} - {card.localId}
                </p>
                <h1>{localizeCardName(card.name)}</h1>
                <p className="detail-summary">
                  {localizedTypes.join(', ') || categoryLabel}
                  {' - '}
                  {localizeRarity(card.rarity)}
                  {card.hp ? ` - ${card.hp} PS` : ''}
                </p>

                <div className="detail-stats">
                  <article className="summary-card">
                    <p>Set</p>
                    <strong>{card.setName}</strong>
                    <small>{set?.releaseDate || 'Data di uscita non disponibile'}</small>
                  </article>
                  <article className="summary-card">
                    <p>Categoria</p>
                    <strong>{card.stage ? localizeStage(card.stage) : categoryLabel}</strong>
                    <small>{localizeSuffix(card.suffix)}</small>
                  </article>
                  <article className="summary-card">
                    <p>Archivio</p>
                    <strong>Scheda completa</strong>
                    <small>Dettagli carta raccolti nel portale</small>
                  </article>
                </div>
              </div>
            </section>

            <section className="detail-grid">
              <article className="detail-panel">
                <h2>Attacchi</h2>
                {!isPokemonCard ? (
                  <p>Questa carta non usa attacchi come una carta Pokemon, quindi qui trovi solo i dettagli principali.</p>
                ) : card.attacks.length === 0 ? (
                  <p>Gli attacchi dettagliati non sono ancora disponibili per questa carta nella fonte attuale.</p>
                ) : (
                  <div className="attack-list">
                    {card.attacks.map((attack) => (
                      <article key={attack.name} className="attack-card">
                        <div className="attack-topline">
                          <strong>{localizeCardName(attack.name)}</strong>
                          <span>{attack.damage ?? 'Nessun danno indicato'}</span>
                        </div>
                        {attack.cost?.length ? (
                          <p>Costo: {localizeTypes(attack.cost).join(', ')}</p>
                        ) : null}
                        {attack.effect ? <p>{attack.effect}</p> : null}
                      </article>
                    ))}
                  </div>
                )}
              </article>

              <article className="detail-panel">
                <h2>Dettagli carta</h2>
                <ul className="detail-list">
                  <li>Set: {card.setName}</li>
                  <li>Numero: #{card.localId}</li>
                  <li>Rarita: {localizeRarity(card.rarity)}</li>
                  <li>Tipo: {localizedTypes.join(', ') || categoryLabel}</li>
                  <li>Categoria: {categoryLabel}</li>
                  {isPokemonCard ? <li>Stadio: {localizeStage(card.stage)}</li> : null}
                  <li>Suffisso: {localizeSuffix(card.suffix)}</li>
                  {isPokemonCard ? (
                    <li>
                      Debolezza:{' '}
                      {card.weaknesses
                        .map((entry) => `${localizeTypes([entry.type])[0]} ${entry.value ?? ''}`.trim())
                        .join(', ') || 'Non disponibile'}
                    </li>
                  ) : null}
                  {isPokemonCard ? <li>Ritirata: {card.retreat ?? 'Non disponibile'}</li> : null}
                  <li>Illustratore: {card.illustrator ?? 'Non disponibile'}</li>
                  <li>Aggiornata il: {card.updated ?? 'Non disponibile'}</li>
                </ul>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
