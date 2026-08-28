-- ============================================================
-- price_submissions — V2 migration
-- Run in Supabase SQL Editor after the initial V1 migration.
-- Adds: observed_date, unit_price, std_qty, std_unit
-- ============================================================

ALTER TABLE price_submissions
  ADD COLUMN IF NOT EXISTS observed_date  DATE,
  ADD COLUMN IF NOT EXISTS unit_price     NUMERIC(10, 4),
  ADD COLUMN IF NOT EXISTS std_qty        NUMERIC(10, 4),
  ADD COLUMN IF NOT EXISTS std_unit       VARCHAR(20);

-- Back-fill observed_date for existing rows (use submitted_at date)
UPDATE price_submissions
SET observed_date = submitted_at::DATE
WHERE observed_date IS NULL;

-- Make observed_date NOT NULL with default going forward
ALTER TABLE price_submissions
  ALTER COLUMN observed_date SET DEFAULT CURRENT_DATE;

-- Index for time-series queries (price trends by city + item over time)
CREATE INDEX IF NOT EXISTS idx_ps_timeseries
  ON price_submissions (city, item_id, observed_date DESC);

-- ============================================================
-- Update the aggregation view to include observed_date range
-- ============================================================

CREATE OR REPLACE VIEW price_aggregates AS
SELECT
  city,
  item_id,
  item_label,
  unit,
  std_unit,
  ROUND(AVG(price)::NUMERIC, 2)    AS avg_price,
  ROUND(AVG(unit_price)::NUMERIC, 4) AS avg_unit_price,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)::NUMERIC, 2) AS median_price,
  COUNT(*)                         AS observation_count,
  MIN(observed_date)               AS earliest_observation,
  MAX(observed_date)               AS latest_observation
FROM price_submissions
WHERE
  status = 'approved'
  AND observed_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY city, item_id, item_label, unit, std_unit
HAVING COUNT(*) >= 5;
