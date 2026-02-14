import { useQuery, keepPreviousData } from '@tanstack/react-query'
import axios from 'axios'
import type { RaceResponse } from '@/lib/calculator/types'

export function useRaceData(selectedDate?: string) {
  return useQuery<RaceResponse>({
    queryKey: ['races', selectedDate ?? 'default'],
    queryFn: async () => {
      try {
        const url = selectedDate
          ? `/api/recent-grade-race?date=${selectedDate}`
          : '/api/recent-grade-race'
        const response = await axios.get(url)
        return response.data
      } catch (error) {
        console.error('Failed to fetch race data:', error)
        throw error
      }
    },
    placeholderData: keepPreviousData,
  })
}
