import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 1800 // 30-minute server-side cache

export type EoiVal = 'High' | 'Mid' | 'Low'

export type OccFit = {
  score: number
  hpiYears: number
  rpi: number
  eoi: EoiVal
}

export type CityIndex = {
  id: string
  name: string
  province: string
  short: string
  eoi: number
  tai: number
  hai: number
  eqi: number
  tci: number
  psi: number
  edi: number
  taiNote: string
  medianRent: number | null
  basePrice: number | null
}

export type CityScoresResponse = {
  cityIndices: Record<string, CityIndex>
  fitMatrix: Record<string, Record<string, OccFit>>
  updatedAt: string
}

export async function GET() {
  try {
    const [indicesRes, scoresRes] = await Promise.all([
      supabase.from('city_indices').select('*'),
      supabase.from('city_occupation_scores').select('*'),
    ])

    if (indicesRes.error) throw indicesRes.error
    if (scoresRes.error)  throw scoresRes.error

    // Shape city_indices → Record<id, CityIndex>
    const cityIndices: Record<string, CityIndex> = {}
    for (const row of indicesRes.data ?? []) {
      cityIndices[row.id] = {
        id:          row.id,
        name:        row.name,
        province:    row.province,
        short:       row.short,
        eoi:         row.eoi,
        tai:         row.tai,
        hai:         row.hai,
        eqi:         row.eqi,
        tci:         row.tci,
        psi:         row.psi,
        edi:         row.edi,
        taiNote:     row.tai_note,
        medianRent:  row.median_rent,
        basePrice:   row.base_price,
      }
    }

    // Shape city_occupation_scores → FIT_MATRIX format
    const fitMatrix: Record<string, Record<string, OccFit>> = {}
    for (const row of scoresRes.data ?? []) {
      if (!fitMatrix[row.city_id]) fitMatrix[row.city_id] = {}
      fitMatrix[row.city_id][row.occupation_id] = {
        score:    row.score,
        hpiYears: parseFloat(row.hpi_years),
        rpi:      row.rpi,
        eoi:      row.eoi as EoiVal,
      }
    }

    return NextResponse.json({
      cityIndices,
      fitMatrix,
      updatedAt: new Date().toISOString(),
    } satisfies CityScoresResponse)
  } catch (err) {
    console.error('[city-scores]', err)
    return NextResponse.json({ error: 'Failed to load city scores' }, { status: 500 })
  }
}
