// Types for the Share Insight feature.
// All fields mirror the shared_insights Supabase table.

export type IncomeDisplay = 'hidden' | 'range' | 'exact'
export type CountryScope  = 'Canada' | 'USA' | 'Canada + USA'

/** One city's result stored inside the JSONB city_results column */
export interface SharedCityResult {
  cityId:    string
  cityName:  string
  province:  string
  hpiYears:  number
  rpi:       number          // Rent-to-income % (gross)
  score:     number          // 10–99
  level:     string          // 'L1 Lower Pressure' … 'L5 Severe Pressure'
  housingType: string        // '1br' | '2br' etc. (label, not id)
}

/** Full record as stored in / returned from Supabase */
export interface SharedInsight {
  id:                  string
  content_hash:        string
  occupation_id:       string
  occupation_name:     string
  country_scope:       CountryScope
  housing_type:        string          // property type id
  city_results:        SharedCityResult[]
  highest_score_city:  string
  key_insight:         string | null
  income_display:      IncomeDisplay
  income_range:        string | null   // e.g. '$80K–$90K'
  income_exact:        number | null
  calculation_version: string
  data_version:        string
  created_at:          string
  last_accessed_at:    string | null
  access_count:        number
}

/** Payload sent from the client to POST /api/share */
export interface CreateSharePayload {
  occupation_id:       string
  occupation_name:     string
  housing_type:        string
  city_results:        SharedCityResult[]
  income_display:      IncomeDisplay
  income_value?:       number          // used to compute income_range or income_exact
}

/** Response from POST /api/share */
export interface CreateShareResponse {
  id:  string           // nanoid(8) — the short share token
  url: string           // full canonical share URL
  new: boolean          // false = dedup hit, existing record returned
}
