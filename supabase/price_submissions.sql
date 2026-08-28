-- ============================================================
-- price_submissions
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS price_submissions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  city          VARCHAR(50) NOT NULL,
  category      VARCHAR(50) NOT NULL,
  item_id       VARCHAR(60) NOT NULL,
  item_label    TEXT        NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  unit          VARCHAR(40),
  store         TEXT,
  email         TEXT,
  photo_url     TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending'  = new, not yet in aggregation
  -- 'approved' = included in aggregated city index
  -- 'rejected' = outlier / duplicate / flagged
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for aggregation queries
CREATE INDEX IF NOT EXISTS idx_ps_city_item    ON price_submissions (city, item_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ps_status       ON price_submissions (status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ps_submitted_at ON price_submissions (submitted_at DESC);

-- Row Level Security
ALTER TABLE price_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (the API will write on behalf of the user)
-- Service-role key (used by the API route) bypasses RLS automatically.
-- This policy is a fallback for direct anon access if needed.
CREATE POLICY "anon_insert" ON price_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- No public reads — data is only read server-side via service role
-- (prevents leaking emails and raw submissions to the public)

-- ============================================================
-- Aggregation view (used by city pages to show community prices)
-- Only includes approved rows with >= 5 observations per item/city.
-- ============================================================

CREATE OR REPLACE VIEW price_aggregates AS
SELECT
  city,
  item_id,
  item_label,
  unit,
  ROUND(AVG(price)::NUMERIC, 2)    AS avg_price,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)::NUMERIC, 2) AS median_price,
  COUNT(*)                         AS observation_count,
  MAX(submitted_at)                AS last_updated
FROM price_submissions
WHERE
  status = 'approved'
  AND submitted_at >= NOW() - INTERVAL '30 days'
GROUP BY city, item_id, item_label, unit
HAVING COUNT(*) >= 5;

-- ============================================================
-- Storage bucket (manual step in Supabase Dashboard)
-- ============================================================
-- 1. Go to Storage → New bucket
-- 2. Name: price-photos
-- 3. Public: YES (so photo URLs are publicly accessible)
-- 4. File size limit: 5 MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp
--
-- Then add this RLS policy on the bucket:
--   INSERT: allow anon
--   SELECT: allow all (public reads)
-- ============================================================
