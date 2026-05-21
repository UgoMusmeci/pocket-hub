import type { CatalogSet } from '../types/catalog'

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
  const words = set.name.split(' ')
  const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(' ')
  const secondLine = words.slice(Math.ceil(words.length / 2)).join(' ')
  const presetClass = presetMap[set.id] ?? 'preset-default'

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
