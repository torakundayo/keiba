type RaceHeaderProps = {
  raceName: string
  raceDate: string
  onReset: () => void
}

export function RaceHeader({ raceName, raceDate, onReset }: RaceHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-200">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{raceName}</h2>
        {raceDate && (
          <p className="text-xs text-slate-400 mt-0.5">{raceDate}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onReset}
        className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        リセット
      </button>
    </div>
  )
}
