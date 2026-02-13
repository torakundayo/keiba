"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TbHorse } from 'react-icons/tb'

export function ExplanationCard() {
  return (
    <Card className="mb-10 shadow-2xl border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-blue-500 py-4">
        <CardTitle className="flex items-center space-x-3 text-xl md:text-2xl text-white">
          <TbHorse className="h-6 w-6 md:h-8 md:w-8 text-white" />
          <span>どういうツール？</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 md:p-8">
        <div className="space-y-4">
          <p>
            このツールは、<strong>3連複馬券の買い目を分析・評価する</strong>ためのシミュレーターです。
            各馬の単勝オッズと設定した重みから、理論的な期待リターンを計算し、
            どの組み合わせに投資価値があるかを判断するための指標を提供します。
          </p>
          <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-3">
            <h4 className="text-[16px] md:text-lg font-medium text-blue-900">主なポイント</h4>
            <div className="space-y-1">
              <p>・単勝オッズから3連複の理論オッズを予測</p>
              <p>・重みづけによる買い目の調整が可能</p>
              <p>・全組み合わせの期待リターンを一括計算</p>
            </div>
          </div>
          <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-3">
            <h4 className="text-[16px] md:text-lg font-medium text-blue-900">使い方</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>各馬の重みを設定（重視したい馬は重みを大きく）</li>
              <li>単勝オッズを入力（レース選択でインポート可能）</li>
              <li>計算ボタンを押して結果を確認</li>
            </ol>
          </div>
          <p className="text-sm text-gray-600">
            ※このツールは理論的な計算に基づく参考値を提供するものであり、
            実際の馬券的中や利益を保証するものではありません。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
