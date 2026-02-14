"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function TierLegend() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="mt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        <span>推奨度と割安度の見方</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="mt-3 space-y-4 text-xs text-slate-500">
          <div>
            <p className="font-medium text-slate-600 mb-1.5">推奨度（2軸判定）</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-semibold text-[11px]">推奨</span>
                <span>的中確率が高く、市場より割安</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded-md bg-teal-100 text-teal-700 font-semibold text-[11px]">有望</span>
                <span>的中確率が高く、割安度100%超え</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 font-semibold text-[11px]">堅実</span>
                <span>的中確率は高いが、配当面は不利</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 font-semibold text-[11px]">穴狙い</span>
                <span>的中確率は低いが、市場より割安</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold text-[11px]">非推奨</span>
                <span>的中確率が低く、市場より割高</span>
              </div>
            </div>
          </div>
          <div>
            <p className="font-medium text-slate-600 mb-1.5">割安度</p>
            <p>100%を超えていれば、単勝市場の評価より複勝市場の評価が高い（=市場が過小評価している）組み合わせです。あくまでモデル上の相対評価であり、利益を保証するものではありません。</p>
          </div>
          <div>
            <p className="font-medium text-slate-600 mb-1.5">確率の濃淡</p>
            <p>確率が0.1%未満の推奨は薄く表示されます。推奨でも確率が極端に低い組み合わせはモデルの構造的な歪みで高く出ている可能性があります。</p>
          </div>
        </div>
      )}
    </section>
  )
}
