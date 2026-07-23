import { useMemo, useState } from 'react'
import { CardTile } from '../components/CardTile'
import { useCatalog } from '../hooks/useCatalog'
import {
  getRarityIcon,
  localizeCategory,
  localizeRarity,
  localizeType,
  normalizeSearchText,
} from '../lib/catalog'
import { usePageMeta } from '../hooks/usePageMeta'
import type { CatalogCard, CatalogSet } from '../types/catalog'

type FilterState = {
  search: string
  expansion: string
  category: string
  type: string
  rarities: string[]
}

const initialFilters: FilterState = {
  search: '',
  expansion: 'all',
  category: 'all',
  type: 'all',
  rarities: [],
}

const rarityOrder = [
  'Crown',
  'Three Star',
  'Two Star',
  'Two Shiny',
  'One Star',
  'One Shiny',
  'Four Diamond',
  'Three Diamond',
  'Two Diamond',
  'One Diamond',
  'None',
]

const emptyCards: CatalogCard[] = []
const emptySets: CatalogSet[] = []

function matchesFilters(card: CatalogCard, filters: FilterState) {
  const normalizedSearch = filters.search.trim().toLowerCase()
  const searchMatch =
    normalizedSearch.length === 0 ||
    normalizeSearchText(card).includes(normalizedSearch)

  const expansionMatch = filters.expansion === 'all' || card.setId === filters.expansion
  const categoryMatch = filters.category === 'all' || card.category === filters.category
  const typeMatch =
    filters.type === 'all' || card.types.some((type) => type === filters.type)
  const rarityMatch =
    filters.rarities.length === 0 || filters.rarities.includes(card.rarity ?? 'None')

  return searchMatch && expansionMatch && categoryMatch && typeMatch && rarityMatch
}

export function CardsPage() {
  usePageMeta({
    title: 'Carte Pokemon Pocket | Pocket Hub',
    description:
      'Sfoglia tutte le carte di Pokemon Pocket con ricerca, filtri per espansione, categoria, tipo e rarità.',
  })
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const { catalog, loading, error } = useCatalog()

  const sets = catalog?.sets ?? emptySets
  const cards = catalog?.cards ?? emptyCards

  const filteredCards = useMemo(
    () => cards.filter((card) => matchesFilters(card, filters)),
    [cards, filters],
  )

  const groupedCards = useMemo(
    () =>
      sets
        .map((set) => ({
          set,
          cards: filteredCards.filter((card) => card.setId === set.id),
        }))
        .filter((group) => group.cards.length > 0),
    [filteredCards, sets],
  )

  const cardTypes = useMemo(
    () => [...new Set(cards.flatMap((card) => card.types))].sort(),
    [cards],
  )

  const categories = useMemo(
    () => [...new Set(cards.map((card) => card.category))].sort(),
    [cards],
  )

  const rarities = useMemo(
    () =>
      [
        ...new Set(
          cards
            .map((card) => card.rarity ?? 'None')
            .filter((rarity): rarity is string => Boolean(rarity)),
        ),
      ].sort((left, right) => {
        const leftIndex = rarityOrder.indexOf(left)
        const rightIndex = rarityOrder.indexOf(right)

        if (leftIndex === -1 && rightIndex === -1) {
          return left.localeCompare(right)
        }

        if (leftIndex === -1) {
          return 1
        }

        if (rightIndex === -1) {
          return -1
        }

        return leftIndex - rightIndex
      }),
    [cards],
  )

  function toggleRarity(rarity: string) {
    setFilters((current) => ({
      ...current,
      rarities: current.rarities.includes(rarity)
        ? current.rarities.filter((entry) => entry !== rarity)
        : [...current.rarities, rarity],
    }))
  }

  return (
    <div className="page-shell">
      <main className="cards-page">
        <section className="section-intro">
          <div>
            <p className="section-kicker">Archivio completo</p>
            <h1>Tutte le carte in una pagina dedicata.</h1>
          </div>
          <p className="section-note section-note-inline">
            Cerca, filtra e naviga il catalogo senza appesantire la home page.
          </p>
        </section>

        <section className="archive-section">
          <div className="filters-toolbar">
            <div className="filters-intro">
              <p className="section-kicker">Filtri rapidi</p>
              <h2>Trova subito la carta giusta.</h2>
              <span>Combina ricerca, espansione, categoria, tipo e rarità.</span>
            </div>

            <div className="filters-panel filters-panel-top">
              <label className="input-group">
                <span>Espansione</span>
                <select
                  value={filters.expansion}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      expansion: event.target.value,
                    }))
                  }
                >
                  <option value="all">Tutte</option>
                  {sets.map((set) => (
                    <option key={set.id} value={set.id}>
                      {set.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="input-group">
                <span>Categoria</span>
                <select
                  value={filters.category}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                >
                  <option value="all">Tutte</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {localizeCategory(category)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="input-group">
                <span>Tipo</span>
                <select
                  value={filters.type}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                >
                  <option value="all">Tutti</option>
                  {cardTypes.map((type) => (
                    <option key={type} value={type}>
                      {localizeType(type)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="filters-panel filters-panel-search">
              <label className="input-group search-group">
                <span>Cerca una carta</span>
                <input
                  type="search"
                  placeholder="Es. Pikachu ex, Geni Supremi, Lampo..."
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

            <div className="filters-secondary-row">
              <div className="rarity-filter-group">
                <span className="filter-group-label">Rarità</span>
                <div className="rarity-chip-list" role="group" aria-label="Filtro per rarità">
                  {rarities.map((rarity) => {
                    const active = filters.rarities.includes(rarity)

                    return (
                      <label
                        key={rarity}
                        className={`rarity-chip ${active ? 'rarity-chip-active' : ''}`.trim()}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleRarity(rarity)}
                        />
                        <span className="rarity-chip-icon">{getRarityIcon(rarity)}</span>
                        <span>{localizeRarity(rarity)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <button
                type="button"
                className="ghost-action filters-reset"
                onClick={() => setFilters(initialFilters)}
              >
                Azzera filtri
              </button>
            </div>
          </div>

          {loading ? (
            <article className="empty-state">
              <h3>Sto caricando il catalogo</h3>
              <p>Leggo il file persistente locale con tutte le carte salvate nel progetto.</p>
            </article>
          ) : error ? (
            <article className="empty-state">
              <h3>Errore nel caricamento</h3>
              <p>{error}</p>
            </article>
          ) : (
            <>
              <div className="results-bar">
                <strong>{filteredCards.length} risultati</strong>
                <span>{groupedCards.length} espansioni visibili nel catalogo corrente</span>
              </div>

              <div className="expansion-list">
                {groupedCards.length === 0 ? (
                  <article className="empty-state">
                    <h3>Nessuna carta trovata</h3>
                    <p>Prova a cambiare ricerca o filtri per allargare il catalogo visibile.</p>
                  </article>
                ) : (
                  groupedCards.map((group) => (
                    <section key={group.set.id} className="expansion-block">
                      <div className="expansion-header">
                        <div>
                          <p>{group.set.id}</p>
                          <h3>{group.set.name}</h3>
                        </div>
                        <span>{group.cards.length} carte</span>
                      </div>

                      <div className="card-grid card-grid-dense">
                        {group.cards.map((card) => (
                          <CardTile key={card.id} card={card} />
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
