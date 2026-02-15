"use client"

import type { CombinationResult } from '@/lib/calculator/types'

type FilterBarProps = {
  combinations: CombinationResult[]
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const FILTERS = [
  { key: 'all', label: '全て' },
  { key: '3', label: 'Top 3' },
  { key: '5', label: 'Top 5' },
  { key: '10', label: 'Top 10' },
  { key: '20', label: 'Top 20' },
] as const

export function FilterBar({ combinations, activeFilter, onFilterChange }: FilterBarProps) {
  const total = combinations.length

  return (
    <div className="flex gap-1 overflow-x-auto py-3 border-b border-slate-100">
      {FILTERS.map(filter => {
        const count = filter.key === 'all'
          ? total
          : Math.min(parseInt(filter.key, 10), total)
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onFilterChange(filter.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors
              ${activeFilter === filter.key
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            {filter.label} ({count})
          </button>
        )
      })}
    </div>
  )
}
