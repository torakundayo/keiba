"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Plus, Minus } from 'lucide-react'
import { useSwipeable } from 'react-swipeable'

type HorseInputProps = {
  index: number
  stake: number
  odd: number
  horseName: string
  onStakeChange: (value: number) => void
  onOddChange: (value: number) => void
}

export function HorseInput({
  index,
  stake,
  odd,
  horseName,
  onStakeChange,
  onOddChange,
}: HorseInputProps) {
  const [sliderValue, setSliderValue] = useState(stake)

  useEffect(() => {
    setSliderValue(stake)
  }, [stake])

  const stakeHandlers = useSwipeable({
    onSwipedLeft: () => onStakeChange(Math.max(0, stake - 100)),
    onSwipedRight: () => onStakeChange(stake + 100),
    trackMouse: true,
  })

  const oddHandlers = useSwipeable({
    onSwipedUp: () => onOddChange(odd + 0.1),
    onSwipedDown: () => onOddChange(Math.max(1, odd - 0.1)),
    trackMouse: true,
  })

  return (
    <div className={`${stake === 0 ? 'bg-gray-100' : 'bg-white'
      } rounded-xl shadow p-3 md:p-4 space-y-2 md:space-y-3 transition-colors duration-200`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] md:text-base font-bold text-white md:text-blue-900 bg-blue-800 md:bg-transparent rounded px-1.5 py-0.5 md:p-0">
          <span className="md:hidden">{index + 1}</span>
          <span className="hidden md:inline">{index + 1}番</span>
        </span>
        {horseName && (
          <span className="text-sm md:text-base font-bold text-blue-900 truncate ml-2">{horseName}</span>
        )}
      </div>

      <div className="space-y-3 md:space-y-4">
        {/* 重みの入力 */}
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-0.5 md:gap-2">
            <Label className="text-xs md:text-sm text-gray-600 min-w-[40px] md:min-w-[50px]">重み</Label>
            <div {...stakeHandlers} className="flex-1">
              <Slider
                value={[Math.min(stake, 1000)]}
                onValueChange={(value) => onStakeChange(value[0])}
                min={0}
                max={1000}
                step={100}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 justify-end ml-[40px] md:ml-[50px]">
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onStakeChange(Math.max(0, stake - 100))}
                className="w-[60px] md:w-[70px] h-[32px] md:h-[37px]"
              >
                <Minus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
            <Input
              type="number"
              min={0}
              step={100}
              value={stake}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (!isNaN(value) && value >= 0) {
                  onStakeChange(value)
                }
              }}
              onWheel={(e) => {
                e.preventDefault()
                if (document.activeElement === e.currentTarget) {
                  const delta = e.deltaY > 0 ? -100 : 100
                  const newValue = Math.max(0, stake + delta)
                  onStakeChange(newValue)
                }
              }}
              className="text-center w-[70px] md:w-[80px] h-[32px] md:h-[37px] text-sm md:text-base"
            />
            <div className="md:hidden flex flex-col -space-y-px">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onStakeChange(stake + 100)}
                className="w-[32px] h-[16px] rounded-b-none border-b-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onStakeChange(Math.max(0, stake - 100))}
                className="w-[32px] h-[16px] rounded-t-none"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
            <div className="hidden md:block">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onStakeChange(stake + 100)}
                className="w-[60px] md:w-[70px] h-[32px] md:h-[37px]"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* オッズの入力 */}
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-0.5 md:gap-2">
            <Label className="text-xs md:text-sm text-gray-600 min-w-[40px] md:min-w-[50px]">オッズ</Label>
            <div {...oddHandlers} className="flex-1">
              <Slider
                value={[Math.min(odd, 100)]}
                onValueChange={(value) => onOddChange(value[0])}
                min={1.0}
                max={100.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 justify-end ml-[40px] md:ml-[50px]">
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOddChange(Math.max(1, odd - 0.1))}
                className="w-[60px] md:w-[70px] h-[32px] md:h-[37px]"
              >
                <Minus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
            <Input
              type="number"
              min={1.0}
              step={0.1}
              value={Number(odd).toFixed(1)}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                if (!isNaN(value) && value >= 1.0) {
                  onOddChange(value)
                }
              }}
              onWheel={(e) => {
                e.preventDefault()
                if (document.activeElement === e.currentTarget) {
                  const delta = e.deltaY > 0 ? -0.1 : 0.1
                  onOddChange(Math.max(1, odd + delta))
                }
              }}
              className="text-center w-[70px] md:w-[80px] h-[32px] md:h-[37px] text-sm md:text-base"
            />
            <div className="md:hidden flex flex-col -space-y-px">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOddChange(odd + 0.1)}
                className="w-[32px] h-[16px] rounded-b-none border-b-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOddChange(Math.max(1, odd - 0.1))}
                className="w-[32px] h-[16px] rounded-t-none"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
            <div className="hidden md:block">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOddChange(odd + 0.1)}
                className="w-[60px] md:w-[70px] h-[32px] md:h-[37px]"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
