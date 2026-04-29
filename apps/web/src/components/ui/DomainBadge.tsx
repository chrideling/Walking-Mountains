import { clsx } from 'clsx'
import { Domain } from '@wm/types'
import { DOMAIN_COLORS, DOMAIN_LABELS } from '@/lib/domain'

interface DomainBadgeProps {
  domain: Domain
  size?: 'sm' | 'md'
}

export function DomainBadge({ domain, size = 'md' }: DomainBadgeProps) {
  const colors = DOMAIN_COLORS[domain]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        colors.bg,
        colors.border,
        colors.text,
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', colors.dot)} />
      {DOMAIN_LABELS[domain]}
    </span>
  )
}
