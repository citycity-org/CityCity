import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM = `You are an intent extraction and routing assistant for Lakive — a Canadian city comparison platform helping people decide where to live based on career, housing, and quality of life.

Given a user query (in English or Chinese), extract structured data and generate a recommendation. Return ONLY valid JSON — no markdown, no explanation.

Supported city slugs: vancouver, toronto, calgary, montreal, ottawa
Supported occupation slugs: nurse, doctor, pharmacist, software_eng, data_analyst, it_support, electrician, engineer, plumber, carpenter, teacher, accountant, lawyer, police, firefighter, social_worker, truck_driver, mechanic, chef, retail, self_employed, freelancer, retired

URL patterns:
- Compare two cities: /compare?cities=CITY1,CITY2&occupation=OCC
- City rankings: /ranking?occupation=OCC&region=canada
- Income calculator: /calculate?occupation=OCC
- Default: /ranking

Return this exact JSON shape:
{
  "understood": ["display label 1", "display label 2"],
  "occupation": "slug or null",
  "cities": ["slug1", "slug2"],
  "priority": "housing|employment|education|affordability|tax|null",
  "is_immigrant": true/false,
  "has_children": true/false,
  "recommendation": {
    "text": "1-2 sentence insight relevant to their situation, referencing real Canadian city data",
    "url": "/path?params",
    "ctaText": "Action label →"
  }
}

Rules:
- "understood" chips: human-readable labels shown in the UI (e.g. "Software Engineer", "Toronto", "Moving to Canada")
- If 2 cities detected, recommend Compare tool
- If housing/affordability priority, highlight Calgary advantage
- If immigrant/newcomer, focus on job demand + landing city
- If tax priority, highlight Alberta's no-provincial-tax advantage
- Keep recommendation.text factual and specific (mention actual numbers when relevant)
- If query is too vague, set understood:[] and give a generic routing suggestion`

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  try {
    // ── Call Claude Haiku ───────────────────────────────────────────────────
    const message = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system:     SYSTEM,
      messages:   [{ role: 'user', content: query }],
    })

    const rawText = (message.content[0] as { type: string; text: string }).text.trim()
    // Strip markdown code fences if Claude wraps output in ```json ... ```
    const raw = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    const data = JSON.parse(raw) as {
      understood:    string[]
      occupation:    string | null
      cities:        string[]
      priority:      string | null
      is_immigrant:  boolean
      has_children:  boolean
      recommendation: { text: string; url: string; ctaText: string }
    }

    // ── Log to Supabase (fire-and-forget) ──────────────────────────────────
    supabase.from('advisor_queries').insert({
      query_text:       query,
      occupation:       data.occupation,
      cities:           data.cities,
      priority:         data.priority,
      is_immigrant:     data.is_immigrant,
      has_children:     data.has_children,
      recommendation_url: data.recommendation.url,
      understood:       data.understood,
    }).then(({ error }) => {
      if (error) console.error('[advisor] Supabase log error:', error.message)
    })

    // ── Return result ───────────────────────────────────────────────────────
    return NextResponse.json({
      understood:     data.understood,
      recommendation: {
        text:              data.recommendation.text,
        url:               data.recommendation.url,
        ctaText:           data.recommendation.ctaText,
        highlightCities:   data.cities,
      },
    })

  } catch (err) {
    console.error('[advisor] Error:', err)
    // Graceful fallback — never return 500 to the user
    return NextResponse.json({
      understood: [],
      recommendation: {
        text:    "Tell us your occupation and the cities you're considering — we'll point you to the most relevant data.",
        url:     '/ranking',
        ctaText: 'Explore city rankings →',
        highlightCities: [],
      },
    })
  }
}
