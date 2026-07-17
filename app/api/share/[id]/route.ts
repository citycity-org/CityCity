import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@/lib/supabase-server'

// GET /api/share/[id]  — fetch share record + bump access tracking
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params

  if (!id || id.length > 32) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const db = createServerClient()

  const { data, error } = await db
    .from('shared_insights')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[share GET] error', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fire-and-forget: update access tracking (don't block the response)
  db.from('shared_insights')
    .update({ last_accessed_at: new Date().toISOString(), access_count: (data.access_count ?? 0) + 1 })
    .eq('id', id)
    .then()

  return NextResponse.json(data, {
    headers: {
      // Cache at edge for 60 s; records are immutable so stale-while-revalidate is safe
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
    },
  })
}
