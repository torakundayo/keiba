"use client"

import type { CombinationResult } from '@/lib/calculator/types'

type FilterBarProps = {
  combinations: CombinationResult[]
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const TIERS = [
  { key: 'all', label: '全て' },
  { key: 'recommended', label: '推奨' },
  { key: 'promising', label: '有望' },
  { key: 'solid', label: '堅実' },
  { key: 'longshot', label: '穴狙い' },
  { key: 'avoid', label: '非推奨' },
] as const

export function FilterBar({ combinations, activeFilter, onFilterChange }: FilterBarProps) {
  const counts = {
    all: combinations.length,
    recommended: combinations.filter(c => c.tier === 'recommended').length,
    promising: combinations.filter(c => c.tier === 'promising').length,
    solid: combinations.filter(c => c.tier === 'solid').length,
    longshot: combinations.filter(c => c.tier === 'longshot').length,
    avoid: combinations.filter(c => c.tier === 'avoid').length,
  }

  return (
    <div className="flex gap-1 overflow-x-auto py-3 border-b border-slate-100">
      {TIERS.map(tier => (
        <button
          key={tier.key}
          type="button"
          onClick={() => onFilterChange(tier.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors
            ${activeFilter === tier.key
              ? 'bg-slate-800 text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
        >
          {tier.label} ({counts[tier.key]})
        </button>
      ))}
    </div>
  )
}
