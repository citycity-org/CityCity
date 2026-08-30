-- ============================================================
-- price_submissions V3 — add currency + US city support
-- Run in Supabase SQL Editor
-- ============================================================

ALTER TABLE price_submissions
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'CAD';

-- Index for cross-currency aggregation queries
CREATE INDEX IF NOT EXISTS idx_ps_currency
  ON price_submissions (currency, city, item_id, observed_date DESC);
