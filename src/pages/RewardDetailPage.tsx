import { Link, useParams } from 'react-router-dom'
import { RewardVisual } from '../components/RewardVisual'
import {
  formatRewardDate,
  getRewardBySlug,
  localizeRewardAvailability,
  localizeRewardContext,
  localizeRewardMethod,
  localizeRewardName,
  localizeRewardText,
  localizeRewardType,
} from '../lib/rewards'
import { getRewardOriginDetails } from '../lib/rewardOrigins'

export function RewardDetailPage() {
  const { rewardSlug } = useParams()
  const reward = rewardSlug ? getRewardBySlug(rewardSlug) : undefined
  const origin = reward ? getRewardOriginDetails(reward) : null
  const relatedEvents = origin?.linkedEvents ?? []

  return (
    <div className="page-shell detail-shell">
      <main className="detail-page">
        <Link to="/ricompense" className="back-link">
          Torna agli emblemi
        </Link>

        {!reward || !origin ? (
          <article className="empty-state">
            <h3>Emblema non trovato</h3>
            <p>Apri l&apos;archivio emblemi e scegli una guida disponibile.</p>
          </article>
        ) : (
          <>
            <section className="detail-hero reward-detail-hero">
              <div className="detail-art reward-detail-art">
                <RewardVisual reward={reward} size="large" />
              </div>

              <div className="detail-copy">
                <p className="eyebrow">{localizeRewardType(reward.type)}</p>
                <h1>{localizeRewardName(reward.name)}</h1>
                <p className="detail-summary">{localizeRewardText(reward.description)}</p>

                <div className="origin-chip-list">
                  <span className="origin-chip origin-chip-primary">{origin.label}</span>
                  {origin.linkedExpansionNames.map((expansionName) => (
                    <span key={expansionName} className="origin-chip">
                      {expansionName}
                    </span>
                  ))}
                </div>

                <div className="detail-stats">
                  <article className="summary-card">
                    <p>Origine</p>
                    <strong>{origin.label}</strong>
                    <small>{localizeRewardContext(origin.context)}</small>
                  </article>
                  <article className="summary-card">
                    <p>Stato</p>
                    <strong>{localizeRewardAvailability(reward.availability)}</strong>
                    <small>
                      {reward.startDate && reward.endDate
                        ? `${formatRewardDate(reward.startDate)} - ${formatRewardDate(reward.endDate)}`
                        : 'Voce archivio utile per seguire tutto il contenuto presente nel gioco'}
                    </small>
                  </article>
                  <article className="summary-card">
                    <p>Eventi collegati</p>
                    <strong>{relatedEvents.length}</strong>
                    <small>Eventi del portale che distribuiscono questo emblema</small>
                  </article>
                </div>
              </div>
            </section>

            <section className="detail-grid">
              <article className="detail-panel">
                <h2>Come si ottiene</h2>
                <p>{localizeRewardText(reward.requirement)}</p>
                {reward.notes ? (
                  <>
                    <h3>Note utili</h3>
                    <p>{localizeRewardText(reward.notes)}</p>
                  </>
                ) : null}
              </article>

              <article className="detail-panel reward-origin-panel">
                <h2>Origine dell&apos;emblema</h2>
                <ul className="detail-list">
                  <li>Tipo: Emblema</li>
                  <li>Metodo catalogato: {localizeRewardMethod(reward.method)}</li>
                  <li>Disponibilita: {localizeRewardAvailability(reward.availability)}</li>
                  <li>Origine principale: {origin.label}</li>
                  <li>Contesto: {localizeRewardContext(origin.context)}</li>
                </ul>
              </article>
            </section>

            {origin.linkedExpansionNames.length > 0 ? (
              <section className="detail-panel event-links-panel">
                <h2>Espansioni collegate</h2>
                <div className="event-link-list">
                  {origin.linkedExpansionNames.map((expansionName) => (
                    <span key={expansionName} className="event-link-chip event-link-chip-static">
                      {expansionName}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {relatedEvents.length > 0 ? (
              <section className="detail-panel event-links-panel">
                <h2>Eventi collegati</h2>
                <div className="event-link-list">
                  {relatedEvents.map((event) => (
                    <Link key={event.slug} to={`/eventi/${event.slug}`} className="event-link-chip">
                      {event.name}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}
