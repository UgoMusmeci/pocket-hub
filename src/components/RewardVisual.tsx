import { useState } from 'react'
import {
  getRewardTypeAccent,
  getRewardTypeBadgeIcon,
  localizeRewardContext,
  localizeRewardName,
  localizeRewardType,
} from '../lib/rewards'
import type { RewardGuide } from '../types/rewards'

type RewardVisualProps = {
  reward: RewardGuide
  size?: 'default' | 'large'
}

export function RewardVisual({ reward, size = 'default' }: RewardVisualProps) {
  const typeLabel = localizeRewardType(reward.type)
  const [imageSrc, setImageSrc] = useState(reward.imageUrl)

  return (
    <div className={`reward-visual ${getRewardTypeAccent(reward.type)} reward-visual-${size}`.trim()}>
      <img
        className="reward-visual-image"
        src={imageSrc}
        alt={localizeRewardName(reward.name)}
        loading="lazy"
        onError={() => {
          if (imageSrc !== reward.sourceImageUrl) {
            setImageSrc(reward.sourceImageUrl)
          }
        }}
      />
      <div className="reward-visual-inner">
        <span className="reward-visual-type">{typeLabel}</span>
        <strong>{localizeRewardName(reward.name)}</strong>
        <small>{localizeRewardContext(reward.sourceContext)}</small>
      </div>
      <div className="reward-visual-mark" aria-hidden="true">
        <img
          className="reward-visual-badge-icon"
          src={getRewardTypeBadgeIcon(reward.type)}
          alt=""
        />
      </div>
    </div>
  )
}
