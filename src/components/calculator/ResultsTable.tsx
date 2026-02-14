"use client"

import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { CombinationResult, SortConfig } from '@/lib/calculator/types'
import { RESULTS_PER_PAGE } from '@/lib/calculator/types'

type ResultsTableProps = {
  sortedCombinations: CombinationResult[]
  sortConfig: SortConfig
  showAllResults: boolean
  resultsRef: React.RefObject<HTMLDivElement>
  onSort: (key: keyof CombinationResult) => void
  onSetShowAll: (show: boolean) => void
}

export function ResultsTable({
  sortedCombinations,
  sortConfig,
  showAllResults,
  resultsRef,
  onSort,
  onSetShowAll,
}: ResultsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base md:text-lg">
        <thead>
          <tr className="bg-blue-50/80">
            {[
              { key: 'horses', label: '組合せ' },
              { key: 'stake', label: '掛け金' },
              { key: 'approximateOdds', label: '予想オッズ' },
              { key: 'expectedReturn', label: '期待リターン' },
              {
                key: 'probability',
                label: (
                  <div className="flex items-center gap-1">
                    確率
                    <div className="hidden md:block">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent className="text-left max-w-[300px] p-3 text-sm font-normal">
                            Harvilleモデルによる確率推定です。単純積モデルとの差が大きい組み合わせほど、期待値が0.75から乖離します。
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ),
              },
            ].map(({ key, label }) => (
              <th
                key={key}
                onClick={() => onSort(key as keyof CombinationResult)}
                className={`
                  cursor-pointer p-2 md:p-3 text-left text-sm md:text-base font-medium text-gray-600
                  hover:text-blue-600 transition-colors duration-200
                  ${key === 'horses' ? 'text-left' : 'text-right'}
                `}
              >
                <div className="flex items-center gap-1 justify-end">
                  {label}
                  {sortConfig?.key === key && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedCombinations
            .slice(0, showAllResults ? undefined : RESULTS_PER_PAGE.desktop)
            .map((combo, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="text-left p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                  {combo.horses.join('-')}
                </td>
                <td className="text-right p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                  {combo.stake.toLocaleString()}<span className="text-[10px] md:text-[14px]">円</span>
                </td>
                <td className="text-right p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                  {combo.approximateOdds.toFixed(1)}
                </td>
                <td className="text-right p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                  {Math.round(combo.expectedReturn).toLocaleString()}<span className="text-[10px] md:text-[14px]">円</span>
                </td>
                <td className="text-right p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                  {(combo.probability * 100).toFixed(2)}<span className="text-[10px] md:text-[14px]">%</span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {!showAllResults && sortedCombinations.length > RESULTS_PER_PAGE.desktop && (
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSetShowAll(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            残り{sortedCombinations.length - RESULTS_PER_PAGE.desktop}件を表示
          </Button>
        </div>
      )}

      {showAllResults && sortedCombinations.length > RESULTS_PER_PAGE.desktop && (
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onSetShowAll(false)
              resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            表示を折りたたむ
          </Button>
        </div>
      )}
    </div>
  )
}
