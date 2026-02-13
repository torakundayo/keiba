'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { TooltipProvider } from "@/components/ui/tooltip"
import { CalculatorProvider } from '@/contexts/CalculatorContext'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分
        gcTime: 1000 * 60 * 30, // 30分
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CalculatorProvider>
          {children}
        </CalculatorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}