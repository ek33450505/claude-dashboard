import { useQuery } from '@tanstack/react-query'
import type { OutputFile } from '../types'

async function fetchOutputs(category: 'briefings' | 'meetings' | 'reports'): Promise<OutputFile[]> {
  const res = await fetch(`/api/outputs/${category}`)
  if (!res.ok) throw new Error(`Failed to fetch ${category}`)
  return res.json()
}

export const useOutputs = (category: 'briefings' | 'meetings' | 'reports') =>
  useQuery({
    queryKey: ['outputs', category],
    queryFn: () => fetchOutputs(category),
  })
