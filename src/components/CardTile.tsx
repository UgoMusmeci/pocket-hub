import { HoverCardLink } from './HoverCardLink'
import {
  getCardImageUrl,
  getPrimaryType,
  handleCardImageError,
  localizeCardName,
  localizeCategory,
  localizeRarity,
  localizeTypes,
} from '../lib/catalog'
import type { CatalogCard } from '../types/catalog'

type CardTileProps = {
  card: CatalogCard
}

export function CardTile({ card }: CardTileProps) {
  const primaryType = getPrimaryType(card).toLowerCase()
  const localizedTypes = localizeTypes(card.types)
  const categoryLabel = localizeCategory(card.category)
  const imageUrl = getCardImageUrl(card)

  return (
    <HoverCardLink to={`/carte/${card.id}`} className="card-tile card-link" card={card}>
      <div className={`card-art type-${primaryType} ${imageUrl ? '' : 'card-art-empty'}`.trim()}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={localizeCardName(card.name)}
            loading="lazy"
            onError={(event) => {
              handleCardImageError(event.currentTarget, 'card-art-empty')
            }}
          />
        ) : null}
        <div className="card-art-fallback" aria-hidden={Boolean(imageUrl)}>
          <span>{card.setId}</span>
          <strong>{localizeCardName(card.name)}</strong>
        </div>
      </div>
      <div className="card-meta">
        <div className="card-title-row">
          <h4>{localizeCardName(card.name)}</h4>
          <span>#{card.localId}</span>
        </div>
        <p>
          {localizedTypes.join(', ') || categoryLabel} - {localizeRarity(card.rarity)}
        </p>
        <ul className="tag-list" aria-label={`Dettagli ${localizeCardName(card.name)}`}>
          <li>
            {card.setId} - {card.setName}
          </li>
        </ul>
      </div>
    </HoverCardLink>
  )
}
