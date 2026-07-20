import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  getCardImageUrl,
  handleCardImageError,
  localizeCardName,
  localizeCategory,
  localizeRarity,
} from '../lib/catalog'
import {
  formatEventDate,
  getAdditionalRewardsForEvent,
  getEventBySlug,
  getEventStatus,
  getRewardsForEvent,
  localizeEventStatus,
  localizeEventType,
} from '../lib/events'
import { localizeRewardName, localizeRewardText } from '../lib/rewards'
import { RewardVisual } from '../components/RewardVisual'
import { resolveEventConsumable } from '../lib/eventConsumables'

export function EventDetailPage() {
  const { eventSlug } = useParams()
  const event = eventSlug ? getEventBySlug(eventSlug) : undefined
  const rewards = event ? getRewardsForEvent(event) : []
  const additionalRewards = event ? getAdditionalRewardsForEvent(event) : []
  const consumableItems = event ? event.consumableRewards.map(resolveEventConsumable) : []
  const { catalog } = useCatalog()
  const promoCards =
    event && catalog
      ? event.promoCardIds
          .map((cardId) => catalog.cards.find((card) => card.id === cardId))
          .filter((card): card is NonNullable<typeof card> => Boolean(card))
      : []

  usePageMeta({
    title: event ? `${event.name} | Evento Pokemon Pocket | Pocket Hub` : 'Evento Pokemon Pocket | Pocket Hub',
    description: event
      ? `${event.summary} Consulta periodo, premi consumabili, emblemi collegati e carte promo dell'evento.`
      : 'Apri una scheda evento di Pokemon Pocket con date, premi ed emblemi collegati.',
  })

  return (
    <div className="page-shell detail-shell">
      <main className="detail-page">
        <Link to="/eventi" className="back-link">
          Torna agli eventi
        </Link>

        {!event ? (
          <article className="empty-state">
            <h3>Evento non trovato</h3>
            <p>Apri l&apos;archivio eventi e scegli una guida disponibile.</p>
          </article>
        ) : (
          <>
            <section className="detail-hero event-detail-hero">
              <div className="detail-art event-detail-art">
                <img
                  src={event.imageUrl}
                  alt={event.imageAlt}
                  loading="lazy"
                  onError={(eventImage) => {
                    eventImage.currentTarget.src = '/event-images/default-event.svg'
                  }}
                />
              </div>
              <div className="detail-copy">
                <p className="eyebrow">{localizeEventType(event.type)}</p>
                <h1>{event.name}</h1>
                <p className="detail-summary">{event.description}</p>

                <div className="detail-stats">
                  <article className="summary-card">
                    <p>Periodo</p>
                    <strong>
                      {formatEventDate(event.startDate)} - {formatEventDate(event.endDate)}
                    </strong>
                    <small>Finestra completa dell&apos;evento nel gioco</small>
                  </article>
                  <article className="summary-card">
                    <p>Stato</p>
                    <strong>{localizeEventStatus(getEventStatus(event))}</strong>
                    <small>{event.linkedSetName ?? 'Evento non legato in modo esclusivo a un set'}</small>
                  </article>
                  <article className="summary-card">
                    <p>Emblemi collegati</p>
                    <strong>{rewards.length}</strong>
                    <small>Emblemi gia catalogati nel portale</small>
                  </article>
                </div>
              </div>
            </section>

            <section className="detail-grid">
              <article className="detail-panel">
                <h2>In cosa consiste</h2>
                <p>{event.summary}</p>
                {event.notes ? (
                  <>
                    <h3>Note utili</h3>
                    <p>{event.notes}</p>
                  </>
                ) : null}
              </article>

              <article className="detail-panel">
                <h2>Dettagli evento</h2>
                <ul className="detail-list">
                  <li>Tipo: {localizeEventType(event.type)}</li>
                  <li>
                    Periodo: {formatEventDate(event.startDate)} - {formatEventDate(event.endDate)}
                  </li>
                  <li>Stato: {localizeEventStatus(getEventStatus(event))}</li>
                  {event.linkedSetName ? (
                    <li>
                      Espansione collegata:{' '}
                      {event.linkedSetId ? (
                        <Link to={`/espansioni/${event.linkedSetId}`}>{event.linkedSetName}</Link>
                      ) : (
                        event.linkedSetName
                      )}
                    </li>
                  ) : null}
                </ul>
              </article>
            </section>

            <section className="detail-panel event-rewards-panel">
              <h2>Ricompense consumabili</h2>
              <div className="consumable-grid">
                {consumableItems.map((item) => (
                  <article key={`${event.slug}-${item.raw}`} className={`consumable-card ${item.accent}`.trim()}>
                    <div className="consumable-card-media">
                      <img src={item.icon} alt="" loading="lazy" />
                    </div>
                    <div className="consumable-card-copy">
                      <div className="consumable-card-topline">
                        <strong>{item.label}</strong>
                        {item.quantity ? <span>x{item.quantity}</span> : null}
                      </div>
                      <p>{item.raw}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="detail-panel event-rewards-panel">
              <h2>Emblemi del portale collegati all&apos;evento</h2>
              {rewards.length === 0 ? (
                <p>
                  In questo momento non abbiamo ancora collegato emblemi specifici a questo evento.
                </p>
              ) : (
                <div className="event-table-shell">
                  <table className="event-rewards-table">
                    <thead>
                      <tr>
                        <th>Emblema</th>
                        <th>Come si ottiene</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.map((reward) => (
                        <tr key={reward.slug}>
                          <td>
                            <Link to={`/ricompense/${reward.slug}`} className="event-reward-link">
                              <div className="event-reward-thumb">
                                <RewardVisual reward={reward} />
                              </div>
                              <span>{localizeRewardName(reward.name)}</span>
                            </Link>
                          </td>
                          <td>{localizeRewardText(reward.requirement)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {additionalRewards.length > 0 ? (
              <section className="detail-panel event-rewards-panel">
                <h2>Altri premi dell&apos;evento</h2>
                <div className="event-extra-rewards-grid">
                  {additionalRewards.map((reward) => (
                    <article key={reward.slug} className="event-extra-reward-card">
                      <div className="event-extra-reward-visual">
                        <RewardVisual reward={reward} />
                      </div>
                      <div className="event-extra-reward-copy">
                        <strong>{localizeRewardName(reward.name)}</strong>
                        <p>{localizeRewardText(reward.requirement)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {event.promoCardIds.length > 0 ? (
              <section className="detail-panel event-promo-panel">
                <div className="deck-list-header">
                  <div>
                    <h2>Carte promo dell&apos;evento</h2>
                    <p className="deck-list-intro">
                      Se questo evento distribuisce promo pack o carte promo dedicate, qui puoi
                      vedere subito le carte collegate e aprirne la scheda completa.
                    </p>
                  </div>
                </div>

                {promoCards.length === 0 ? (
                  <p>Stiamo completando il collegamento tra questo evento e il catalogo carte locale.</p>
                ) : (
                  <div className="event-promo-grid">
                    {promoCards.map((card) => {
                      const imageUrl = getCardImageUrl(card)

                      return (
                        <Link key={card.id} to={`/carte/${card.id}`} className="event-promo-card">
                          <div
                            className={`event-promo-art ${imageUrl ? '' : 'event-promo-art-empty'}`.trim()}
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={localizeCardName(card.name)}
                                loading="lazy"
                                onError={(eventImage) => {
                                  handleCardImageError(
                                    eventImage.currentTarget,
                                    'event-promo-art-empty',
                                  )
                                }}
                              />
                            ) : null}
                            <div className="event-promo-fallback" aria-hidden={Boolean(imageUrl)}>
                              <span>{card.setId}</span>
                              <strong>{localizeCardName(card.name)}</strong>
                            </div>
                          </div>
                          <div className="event-promo-copy">
                            <div className="event-promo-title-row">
                              <strong>{localizeCardName(card.name)}</strong>
                              <span>#{card.localId}</span>
                            </div>
                            <p>
                              {card.setName} - {localizeRarity(card.rarity)}
                            </p>
                            <small>{localizeCategory(card.category)}</small>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}
