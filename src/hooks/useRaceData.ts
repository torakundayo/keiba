import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { RaceResponse } from '@/lib/calculator/types'

export function useRaceData() {
  return useQuery<RaceResponse>({
    queryKey: ['recentGradeRace'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/recent-grade-race')
        return response.data
      } catch (error) {
        console.error('Failed to fetch race data:', error)
        throw error
      }
    }
  })
}
