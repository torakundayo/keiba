type PaginationBarProps = {
  visibleCount: number
  totalCount: number
  showAll: boolean
  onToggle: (showAll: boolean) => void
  scrollRef?: React.RefObject<HTMLDivElement>
}

export function PaginationBar({ visibleCount, totalCount, showAll, onToggle, scrollRef }: PaginationBarProps) {
  if (totalCount <= visibleCount && !showAll) return null

  const displayedCount = showAll ? totalCount : Math.min(visibleCount, totalCount)

  return (
    <div className="flex items-center justify-between py-3 text-sm border-t border-slate-100">
      <span className="text-slate-400 tabular-nums">
        {displayedCount} / {totalCount} 通り表示中
      </span>
      {totalCount > visibleCount && (
        <button
          type="button"
          onClick={() => {
            if (showAll && scrollRef?.current) {
              scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            onToggle(!showAll)
          }}
          className="text-slate-600 hover:text-slate-800 font-medium transition-colors"
        >
          {showAll ? '折りたたむ' : `残り${totalCount - visibleCount}件を表示`}
        </button>
      )}
    </div>
  )
}
