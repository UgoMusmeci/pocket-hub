import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  formatEventDate,
  getAllEvents,
  getEventStatus,
  getRewardsForEvent,
  localizeEventStatus,
  localizeEventType,
  matchesEventSearch,
} from '../lib/events'
import type { EventStatus } from '../lib/events'
import type { EventType } from '../types/events'

type EventFilters = {
  search: string
  type: 'all' | EventType
  status: 'all' | EventStatus
}

const initialFilters: EventFilters = {
  search: '',
  type: 'all',
  status: 'all',
}

export function EventsPage() {
  usePageMeta({
    title: 'Eventi Pokemon Pocket | Pocket Hub',
    description:
      'Cronologia e archivio degli eventi di Pokemon TCG Pocket con stato, date, premi consumabili ed emblemi collegati.',
  })
  const [filters, setFilters] = useState<EventFilters>(initialFilters)
  const events = getAllEvents()

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const typeMatch = filters.type === 'all' || event.type === filters.type
        const status = getEventStatus(event)
        const statusMatch = filters.status === 'all' || status === filters.status
        const searchMatch = matchesEventSearch(event, filters.search)
        return typeMatch && statusMatch && searchMatch
      }),
    [events, filters],
  )

  const eventTypes = [...new Set(events.map((event) => event.type))]
  const statuses: EventStatus[] = ['attivo', 'in_arrivo', 'concluso']

  return (
    <div className="page-shell">
      <main className="cards-page">
        <section className="section-intro">
          <div>
            <p className="section-kicker">Eventi</p>
            <h1>Tutti gli eventi del gioco, raccolti in un archivio locale consultabile.</h1>
          </div>
          <p className="section-note section-note-inline">
            Qui trovi la cronologia degli eventi di Pokemon TCG Pocket con periodo, descrizione,
            premi consumabili ed emblemi collegati al portale.
          </p>
        </section>

        <section className="archive-section">
          <div className="filters-toolbar">
            <div className="filters-intro">
              <p className="section-kicker">Filtri archivio</p>
              <h2>Trova subito l&apos;evento che ti interessa.</h2>
              <span>Puoi filtrare per tipo, stato e cercare per nome o contenuto.</span>
            </div>

            <div className="filters-panel filters-panel-top">
              <label className="input-group">
                <span>Tipo evento</span>
                <select
                  value={filters.type}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      type: event.target.value as EventFilters['type'],
                    }))
                  }
                >
                  <option value="all">Tutti</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {localizeEventType(type)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="input-group">
                <span>Stato</span>
                <select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      status: event.target.value as EventFilters['status'],
                    }))
                  }
                >
                  <option value="all">Tutti</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {localizeEventStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="filters-panel filters-panel-search">
              <label className="input-group search-group">
                <span>Cerca un evento</span>
                <input
                  type="search"
                  placeholder="Es. evento emblema, Wonder Pick di febbraio, evento Drop..."
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          </div>

          <div className="results-bar">
            <strong>{filteredEvents.length} eventi</strong>
            <span>Archivio locale con eventi attivi, futuri e storici</span>
          </div>

          <div className="events-grid">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event)
              const linkedEmblems = getRewardsForEvent(event)

              return (
                <Link key={event.slug} to={`/eventi/${event.slug}`} className="event-card">
                  <div className="event-card-topline">
                    <span>{localizeEventType(event.type)}</span>
                    <span>{localizeEventStatus(status)}</span>
                  </div>
                  <div className="event-card-media">
                    <img
                      src={event.imageUrl}
                      alt={event.imageAlt}
                      loading="lazy"
                      onError={(eventImage) => {
                        eventImage.currentTarget.src = '/event-images/default-event.svg'
                      }}
                    />
                  </div>
                  <h3>{event.name}</h3>
                  <p>{event.summary}</p>
                  <ul className="tag-list" aria-label={`Dettagli ${event.name}`}>
                    <li>
                      {formatEventDate(event.startDate)} {'->'} {formatEventDate(event.endDate)}
                    </li>
                    {event.linkedSetName ? <li>{event.linkedSetName}</li> : null}
                    <li>{linkedEmblems.length} emblemi collegati</li>
                  </ul>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
