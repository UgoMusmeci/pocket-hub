import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RewardVisual } from '../components/RewardVisual'
import { getAllEvents } from '../lib/events'
import { getRewardOriginDetails } from '../lib/rewardOrigins'
import {
  getAllRewards,
  localizeRewardAvailability,
  localizeRewardContext,
  localizeRewardName,
  localizeRewardMethod,
  localizeRewardText,
  matchesRewardSearch,
} from '../lib/rewards'
import type { RewardAvailability, RewardMethod } from '../types/rewards'

type RewardFilters = {
  search: string
  method: 'all' | RewardMethod
  availability: 'all' | RewardAvailability
  expansion: 'all' | '__none__' | string
  event: 'all' | string
}

type RewardWithMeta = ReturnType<typeof getAllRewards>[number] & ReturnType<typeof getRewardOriginDetails>

const initialFilters: RewardFilters = {
  search: '',
  method: 'all',
  availability: 'all',
  expansion: 'all',
  event: 'all',
}

function getRewardMeta() {
  const rewards = getAllRewards()
  const events = getAllEvents()
  const expansionNames = [
    ...new Set(events.map((event) => event.linkedSetName).filter((name): name is string => Boolean(name))),
  ]

  const rewardMeta: RewardWithMeta[] = rewards.map((reward) => ({
    ...reward,
    ...getRewardOriginDetails(reward),
  }))

  return { rewardMeta, events, expansionNames }
}

export function RewardsPage() {
  const [filters, setFilters] = useState<RewardFilters>(initialFilters)

  const { rewardMeta, events, expansionNames } = useMemo(() => getRewardMeta(), [])

  const filteredRewards = useMemo(
    () =>
      rewardMeta.filter((reward) => {
        const methodMatch = filters.method === 'all' || reward.method === filters.method
        const availabilityMatch =
          filters.availability === 'all' || reward.availability === filters.availability
        const searchMatch = matchesRewardSearch(reward, filters.search)

        const expansionMatch =
          filters.expansion === 'all'
            ? true
            : filters.expansion === '__none__'
              ? reward.linkedExpansionNames.length === 0
              : reward.linkedExpansionNames.includes(filters.expansion)

        const eventMatch =
          filters.event === 'all' ? true : reward.linkedEvents.some((event) => event.slug === filters.event)

        return (
          methodMatch &&
          availabilityMatch &&
          searchMatch &&
          expansionMatch &&
          eventMatch
        )
      }),
    [filters, rewardMeta],
  )

  const methods = [...new Set(rewardMeta.map((reward) => reward.method))]
  const availabilityStates = [...new Set(rewardMeta.map((reward) => reward.availability))]
  const eventOptions = events.filter((event) => event.rewardSlugs.length > 0)
  const sortedRewards = useMemo(
    () => [...filteredRewards].sort((left, right) => left.name.localeCompare(right.name, 'it')),
    [filteredRewards],
  )

  return (
    <div className="page-shell">
      <main className="cards-page">
        <section className="section-intro">
          <div>
            <p className="section-kicker">Archivio emblemi</p>
            <h1>Tutti gli emblemi del gioco, raccolti in un solo archivio.</h1>
          </div>
          <p className="section-note section-note-inline">
            Qui trovi solo gli emblemi, con indicazioni chiare su come ottenerli e con i collegamenti
            agli eventi o alle espansioni quando sono disponibili.
          </p>
        </section>

        <section className="archive-section">
          <div className="filters-toolbar">
            <div className="filters-intro">
              <p className="section-kicker">Filtri archivio</p>
              <h2>Trova subito l&apos;emblema che ti interessa.</h2>
              <span>Puoi filtrare per metodo, disponibilità, espansione ed evento.</span>
            </div>

            <div className="filters-panel filters-panel-top">

              <label className="input-group">
                <span>Come si ottiene</span>
                <select
                  value={filters.method}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, method: event.target.value as RewardFilters['method'] }))
                  }
                >
                  <option value="all">Tutti i metodi</option>
                  {methods.map((method) => (
                    <option key={method} value={method}>
                      {localizeRewardMethod(method)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="input-group">
                <span>Disponibilita</span>
                <select
                  value={filters.availability}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      availability: event.target.value as RewardFilters['availability'],
                    }))
                  }
                >
                  <option value="all">Tutti gli stati</option>
                  {availabilityStates.map((availability) => (
                    <option key={availability} value={availability}>
                      {localizeRewardAvailability(availability)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="filters-panel filters-panel-top">
              <label className="input-group">
                <span>Espansione</span>
                <select
                  value={filters.expansion}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      expansion: event.target.value as RewardFilters['expansion'],
                    }))
                  }
                >
                  <option value="all">Tutte le espansioni</option>
                  <option value="__none__">Nessuna espansione specifica</option>
                  {expansionNames.map((expansionName) => (
                    <option key={expansionName} value={expansionName}>
                      {expansionName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="input-group">
                <span>Evento</span>
                <select
                  value={filters.event}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      event: event.target.value as RewardFilters['event'],
                    }))
                  }
                >
                  <option value="all">Tutti gli eventi</option>
                  {eventOptions.map((eventOption) => (
                    <option key={eventOption.slug} value={eventOption.slug}>
                      {eventOption.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="filters-panel filters-panel-search">
              <label className="input-group search-group">
                <span>Cerca un emblema</span>
                <input
                  type="search"
                  placeholder="Es. emblema Iono, emblema evento, missione segreta..."
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
            <strong>{sortedRewards.length} emblemi</strong>
            <span>Archivio ordinato alfabeticamente con filtri su origine, evento ed espansione</span>
          </div>

          <div className="rewards-grid">
            {sortedRewards.map((reward) => (
              <Link key={reward.slug} to={`/ricompense/${reward.slug}`} className="reward-card">
                <RewardVisual reward={reward} />
                <div className="reward-card-copy">
                  <div className="reward-card-topline">
                    <span>Emblema</span>
                    <span>{localizeRewardAvailability(reward.availability)}</span>
                  </div>
                  <h3>{localizeRewardName(reward.name)}</h3>
                  <p>{localizeRewardText(reward.description)}</p>
                  <ul className="tag-list" aria-label={`Dettagli ${localizeRewardName(reward.name)}`}>
                    <li>{localizeRewardContext(reward.sourceContext)}</li>
                    <li>{reward.label}</li>
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
