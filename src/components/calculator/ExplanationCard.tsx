"use client"

import { Card, CardContent } from '@/components/ui/card'
import { TbHorse } from 'react-icons/tb'
import { ChevronRight } from 'lucide-react'

export function ExplanationCard() {
  return (
    <Card className="mb-10 card-elevated border-0 rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-0">
        {/* Header strip */}
        <div className="px-6 py-4 md:px-8 md:py-5 border-b border-amber-100/60 bg-gradient-to-r from-amber-50/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm">
              <TbHorse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-semibold text-slate-800">
                どういうツール？
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-5">
          <p className="text-slate-600 leading-relaxed">
            このツールは、<strong className="text-slate-800">3連複馬券の買い目を分析・評価する</strong>ためのシミュレーターです。
            各馬の単勝オッズと設定した重みから、理論的な期待リターンを計算し、
            どの組み合わせに投資価値があるかを判断するための指標を提供します。
          </p>

          <div className="rounded-xl bg-amber-50/60 border border-amber-100/80 p-5 space-y-3">
            <h4 className="text-sm font-semibold text-amber-800 tracking-wide uppercase">
              主なポイント
            </h4>
            <div className="space-y-2">
              {[
                '単勝オッズから3連複の理論オッズを予測',
                '重みづけによる買い目の調整が可能',
                '全組み合わせの期待リターンを一括計算',
              ].map((text) => (
                <div key={text} className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-slate-700 text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
              使い方
            </h4>
            <ol className="space-y-2 ml-1">
              {[
                '各馬の重みを設定（重視したい馬は重みを大きく）',
                '単勝オッズを入力（レース選択でインポート可能）',
                '計算ボタンを押して結果を確認',
              ].map((text, i) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-slate-600 text-sm">{text}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ※このツールは理論的な計算に基づく参考値を提供するものであり、
            実際の馬券的中や利益を保証するものではありません。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
