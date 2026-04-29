import { clsx } from 'clsx'
import type { TodayViewItem } from '@wm/types'
import { DOMAIN_COLORS } from '@/lib/domain'

interface TodayItemProps {
  item: TodayViewItem
}

export function TodayItem({ item }: TodayItemProps) {
  const colors = DOMAIN_COLORS[item.domain]

  return (
    <div className={clsx('p-4 rounded-2xl border', colors.bg, colors.border)}>
      <div className="flex items-start gap-3">
        <div className={clsx('mt-1.5 h-2 w-2 rounded-full shrink-0', colors.dot)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900 leading-snug">{item.title}</p>
          {item.subtitle && (
            <p className="text-sm text-stone-500 mt-0.5">{item.subtitle}</p>
          )}
          {item.scaledNote && (
            <p className={clsx('text-xs mt-1.5 italic', colors.text)}>{item.scaledNote}</p>
          )}
        </div>
      </div>
    </div>
  )
}
