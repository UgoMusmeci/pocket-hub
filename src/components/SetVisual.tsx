import { useEffect, useState } from 'react'
import type { CatalogSet } from '../types/catalog'
import { getSetVisualUrl } from '../lib/catalog'

type SetVisualProps = {
  set: CatalogSet
  size?: 'default' | 'large' | 'detail'
}

const presetMap: Record<string, string> = {
  B1a: 'preset-crimson',
  B2a: 'preset-paldean',
  B2b: 'preset-shine',
  B1: 'preset-sky',
  B2: 'preset-parade',
  'P-A': 'preset-promo-a',
  'P-B': 'preset-promo-b',
}

export function SetVisual({ set, size = 'default' }: SetVisualProps) {
  const visualUrl = getSetVisualUrl(set)
  const [imageFailed, setImageFailed] = useState(false)
  const words = set.name.split(' ')
  const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(' ')
  const secondLine = words.slice(Math.ceil(words.length / 2)).join(' ')
  const presetClass = presetMap[set.id] ?? 'preset-default'

  useEffect(() => {
    setImageFailed(false)
  }, [set.id, visualUrl])

  if (visualUrl && !imageFailed) {
    return (
      <div className={`set-visual-image-shell set-visual-${size}`.trim()} aria-label={set.name}>
        <img
          src={visualUrl}
          alt={`Artwork bustina ${set.name}`}
          className="set-visual-image"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      </div>
    )
  }

  return (
    <div className={`set-visual-card ${presetClass} set-visual-${size}`.trim()} aria-label={set.name}>
      <div className="set-visual-glow"></div>
      <div className="set-visual-inner">
        <span className="set-visual-code">{set.id}</span>
        <strong className="set-visual-line">{firstLine}</strong>
        {secondLine ? <strong className="set-visual-line set-visual-line-accent">{secondLine}</strong> : null}
      </div>
      <div className="set-visual-ball">
        <div className="set-visual-ball-core"></div>
      </div>
    </div>
  )
}
