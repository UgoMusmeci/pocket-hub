import { useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  getCardImageUrl,
  handleCardImageError,
  localizeCardName,
  localizeCategory,
  localizeRarity,
  localizeStage,
  localizeTypes,
} from '../lib/catalog'
import type { CatalogCard } from '../types/catalog'

type HoverPosition = {
  x: number
  y: number
}

type HoverCardLinkProps = {
  to: string
  className: string
  card: CatalogCard
  children: ReactNode
}

function supportsHoverPreview() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function HoverCardLink({ to, className, card, children }: HoverCardLinkProps) {
  const [position, setPosition] = useState<HoverPosition | null>(null)
  const imageUrl = getCardImageUrl(card)
  const localizedTypes = useMemo(() => localizeTypes(card.types), [card.types])
  const categoryLabel = localizeCategory(card.category)

  function updatePosition(event: MouseEvent<HTMLAnchorElement>) {
    if (!supportsHoverPreview()) {
      return
    }

    setPosition({
      x: event.clientX + 18,
      y: Math.max(event.clientY - 18, 18),
    })
  }

  function handleLeave() {
    setPosition(null)
  }

  const preview =
    position && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="hover-card-preview"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            aria-hidden="true"
          >
            <div className="hover-card-preview-art-shell">
              <div
                className={`hover-card-preview-art ${imageUrl ? '' : 'hover-card-preview-art-empty'}`.trim()}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={localizeCardName(card.name)}
                    loading="lazy"
                    onError={(event) => {
                      handleCardImageError(
                        event.currentTarget,
                        'hover-card-preview-art-empty',
                      )
                    }}
                  />
                ) : null}
                <div className="hover-card-preview-fallback">
                  <span>{card.setId}</span>
                  <strong>{localizeCardName(card.name)}</strong>
                </div>
              </div>
            </div>

            <div className="hover-card-preview-copy">
              <p className="hover-card-preview-kicker">
                {card.setId} #{card.localId}
              </p>
              <h4>{localizeCardName(card.name)}</h4>
              <p className="hover-card-preview-meta">
                {localizedTypes.join(', ') || categoryLabel}
                {' · '}
                {localizeRarity(card.rarity)}
                {card.hp ? ` · ${card.hp} PS` : ''}
              </p>
              <ul className="hover-card-preview-list">
                <li>Categoria: {categoryLabel}</li>
                <li>Stadio: {localizeStage(card.stage)}</li>
                <li>
                  Attacco chiave:{' '}
                  {card.attacks[0]?.name ? localizeCardName(card.attacks[0].name) : 'Non disponibile'}
                </li>
              </ul>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <Link
        to={to}
        className={className}
        onMouseEnter={updatePosition}
        onMouseMove={updatePosition}
        onMouseLeave={handleLeave}
        onBlur={handleLeave}
      >
        {children}
      </Link>
      {preview}
    </>
  )
}
