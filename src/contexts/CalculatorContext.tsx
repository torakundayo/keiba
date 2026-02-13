'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useCalculator } from '@/hooks/useCalculator'

type CalculatorContextType = ReturnType<typeof useCalculator>

const CalculatorContext = createContext<CalculatorContextType | null>(null)

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const calculator = useCalculator()
  return (
    <CalculatorContext.Provider value={calculator}>
      {children}
    </CalculatorContext.Provider>
  )
}

export function useCalculatorContext() {
  const context = useContext(CalculatorContext)
  if (!context) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider')
  }
  return context
}
