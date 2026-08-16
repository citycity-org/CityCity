-- 002_city_scores.sql
-- City-level indices and occupation fit scores for dynamic Lakive scoring
-- Run this in the Supabase SQL editor.

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS city_indices (
  id            TEXT        PRIMARY KEY,    -- 'vancouver', 'calgary', 'san-francisco', etc.
  name          TEXT        NOT NULL,
  province      TEXT        NOT NULL,
  short         TEXT        NOT NULL,       -- IATA airport code / short label
  eoi           INTEGER     NOT NULL,       -- Employment Opportunity Index  (0–100)
  tai           INTEGER     NOT NULL,       -- Tax Advantage Index           (0–100)
  hai           INTEGER     NOT NULL,       -- Healthcare Access Index       (0–100)
  eqi           INTEGER     NOT NULL,       -- Environmental Quality Index   (0–100)
  tci           INTEGER     NOT NULL,       -- Transit Connectivity Index    (0–100)
  psi           INTEGER     NOT NULL,       -- Public Safety Index           (0–100)
  edi           INTEGER     NOT NULL,       -- Education Index               (0–100)
  tai_note      TEXT        NOT NULL,       -- Short tax description
  median_rent   INTEGER,                    -- 2BR median asking rent (CAD or USD)
  base_price    INTEGER,                    -- Benchmark 2BR home price
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS city_occupation_scores (
  city_id       TEXT         NOT NULL REFERENCES city_indices(id) ON DELETE CASCADE,
  occupation_id TEXT         NOT NULL,
  score         INTEGER      NOT NULL,      -- City Fit Score 0–99
  hpi_years     NUMERIC(4,1) NOT NULL,      -- Years-to-buy (Housing Price Index proxy)
  rpi           INTEGER      NOT NULL,      -- Rent Pressure Index (% of take-home)
  eoi           TEXT         NOT NULL CHECK (eoi IN ('High','Mid','Low')),
  updated_at    TIMESTAMPTZ  DEFAULT NOW(),
  PRIMARY KEY (city_id, occupation_id)
);

CREATE INDEX IF NOT EXISTS cos_city_idx ON city_occupation_scores(city_id);
CREATE INDEX IF NOT EXISTS cos_occ_idx  ON city_occupation_scores(occupation_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE city_indices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_occupation_scores  ENABLE ROW LEVEL SECURITY;

-- Public read (frontend API route uses anon key)
CREATE POLICY "public read city_indices"
  ON city_indices FOR SELECT USING (true);

CREATE POLICY "public read city_occupation_scores"
  ON city_occupation_scores FOR SELECT USING (true);

-- Service-role-only writes (seed script + admin updates use service role key)
CREATE POLICY "service write city_indices"
  ON city_indices FOR ALL
  USING     (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service write city_occupation_scores"
  ON city_occupation_scores FOR ALL
  USING     (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Seed: city_indices ────────────────────────────────────────────────────────

INSERT INTO city_indices (id, name, province, short, eoi, tai, hai, eqi, tci, psi, edi, tai_note, median_rent, base_price) VALUES
  ('vancouver',     'Vancouver',     'BC',            'YVR', 80, 72, 88, 90, 82, 72, 80, 'GST 5% + PST 7%',         2950,  1050000),
  ('toronto',       'Toronto',       'ON',            'YYZ', 92, 68, 90, 75, 78, 68, 82, 'HST 13%',                 2750,  980000),
  ('calgary',       'Calgary',       'AB',            'YYC', 65, 90, 78, 82, 48, 78, 72, 'GST 5% only (no PST)',    1950,  550000),
  ('montreal',      'Montréal',      'QC',            'YUL', 72, 42, 75, 78, 72, 70, 80, 'GST+QST ≈15%',           1850,  580000),
  ('ottawa',        'Ottawa',        'ON',            'YOW', 75, 68, 82, 80, 55, 82, 85, 'HST 13%',                 2100,  650000),
  ('seattle',       'Seattle',       'Washington',    'SEA', 88, 95, 72, 78, 65, 72, 82, 'No state income tax',     2700,  800000),
  ('san-francisco', 'San Francisco', 'California',    'SFO', 95, 35, 75, 70, 75, 55, 90, 'CA top rate 13.3%',      3500,  1250000),
  ('new-york',      'New York City', 'New York',      'NYC', 92, 30, 78, 62, 88, 58, 92, 'NY+NYC tax up to 14.8%', 3700,  1100000),
  ('boston',        'Boston',        'Massachusetts', 'BOS', 85, 60, 80, 75, 72, 68, 88, 'MA flat 5% state tax',   3100,  850000)
ON CONFLICT (id) DO UPDATE SET
  eoi=EXCLUDED.eoi, tai=EXCLUDED.tai, hai=EXCLUDED.hai, eqi=EXCLUDED.eqi,
  tci=EXCLUDED.tci, psi=EXCLUDED.psi, edi=EXCLUDED.edi,
  tai_note=EXCLUDED.tai_note, median_rent=EXCLUDED.median_rent,
  base_price=EXCLUDED.base_price, updated_at=NOW();

-- ── Seed: city_occupation_scores ─────────────────────────────────────────────

INSERT INTO city_occupation_scores (city_id, occupation_id, score, hpi_years, rpi, eoi) VALUES
  -- vancouver
  ('vancouver','electrician',   72, 13.0, 42, 'High'),
  ('vancouver','software_eng',  84,  9.5, 36, 'High'),
  ('vancouver','nurse',         68, 12.8, 43, 'Mid'),
  ('vancouver','doctor',        82,  5.5, 18, 'High'),
  ('vancouver','pharmacist',    74, 10.5, 35, 'Mid'),
  ('vancouver','data_analyst',  72, 11.5, 38, 'Mid'),
  ('vancouver','it_support',    58, 17.0, 57, 'Mid'),
  ('vancouver','engineer',      70, 11.4, 38, 'Mid'),
  ('vancouver','plumber',       65, 13.5, 45, 'Mid'),
  ('vancouver','carpenter',     55, 15.5, 52, 'Mid'),
  ('vancouver','teacher',       62, 14.0, 46, 'Mid'),
  ('vancouver','accountant',    65, 15.2, 49, 'Mid'),
  ('vancouver','lawyer',        78,  8.1, 27, 'Mid'),
  ('vancouver','police',        70, 12.5, 41, 'High'),
  ('vancouver','firefighter',   68, 12.4, 41, 'High'),
  ('vancouver','social_worker', 42, 18.2, 61, 'Mid'),
  ('vancouver','truck_driver',  52, 16.5, 54, 'Mid'),
  ('vancouver','mechanic',      55, 15.5, 52, 'Mid'),
  ('vancouver','chef',          38, 20.0, 68, 'Mid'),
  ('vancouver','retail',        32, 26.0, 68, 'Mid'),
  ('vancouver','self_employed', 48, 16.2, 54, 'Low'),
  ('vancouver','freelancer',    38, 20.2, 68, 'Low'),
  ('vancouver','unemployed',    22, 42.0,142, 'Low'),
  ('vancouver','retired',       40, 25.0, 84, 'Low'),
  -- toronto
  ('toronto','electrician',   70, 12.5, 40, 'High'),
  ('toronto','software_eng',  88,  9.2, 34, 'High'),
  ('toronto','nurse',         72, 12.0, 41, 'High'),
  ('toronto','doctor',        86,  4.5, 15, 'High'),
  ('toronto','pharmacist',    76,  9.4, 32, 'High'),
  ('toronto','data_analyst',  75, 11.5, 39, 'High'),
  ('toronto','it_support',    60, 15.8, 53, 'High'),
  ('toronto','engineer',      72, 10.7, 36, 'High'),
  ('toronto','plumber',       65, 12.6, 43, 'High'),
  ('toronto','carpenter',     56, 14.5, 49, 'Mid'),
  ('toronto','teacher',       65, 13.2, 44, 'High'),
  ('toronto','accountant',    72, 13.8, 46, 'High'),
  ('toronto','lawyer',        82,  7.6, 25, 'High'),
  ('toronto','police',        68, 11.8, 40, 'High'),
  ('toronto','firefighter',   68, 11.5, 39, 'High'),
  ('toronto','social_worker', 44, 16.9, 57, 'High'),
  ('toronto','truck_driver',  55, 15.8, 52, 'Mid'),
  ('toronto','mechanic',      56, 14.4, 49, 'Mid'),
  ('toronto','chef',          36, 18.8, 63, 'Mid'),
  ('toronto','retail',        30, 24.5, 65, 'Mid'),
  ('toronto','self_employed', 50, 15.1, 51, 'Low'),
  ('toronto','freelancer',    40, 18.8, 63, 'Low'),
  ('toronto','unemployed',    24, 39.2,132, 'Low'),
  ('toronto','retired',       42, 23.3, 79, 'Low'),
  -- calgary
  ('calgary','electrician',   91,  3.9, 24, 'High'),
  ('calgary','software_eng',  78,  5.2, 28, 'Mid'),
  ('calgary','nurse',         86,  4.5, 25, 'High'),
  ('calgary','doctor',        92,  2.5, 11, 'High'),
  ('calgary','pharmacist',    84,  5.2, 22, 'Mid'),
  ('calgary','data_analyst',  76,  6.5, 27, 'Mid'),
  ('calgary','it_support',    68,  8.9, 38, 'Mid'),
  ('calgary','engineer',      82,  6.0, 25, 'High'),
  ('calgary','plumber',       80,  7.1, 30, 'High'),
  ('calgary','carpenter',     72,  8.1, 34, 'Mid'),
  ('calgary','teacher',       80,  5.8, 28, 'Mid'),
  ('calgary','accountant',    78,  6.2, 30, 'Mid'),
  ('calgary','lawyer',        86,  4.2, 18, 'Mid'),
  ('calgary','police',        84,  4.8, 25, 'High'),
  ('calgary','firefighter',   82,  4.6, 24, 'High'),
  ('calgary','social_worker', 64,  9.5, 40, 'Mid'),
  ('calgary','truck_driver',  82,  5.5, 26, 'High'),
  ('calgary','mechanic',      74,  8.1, 34, 'High'),
  ('calgary','chef',          55, 10.6, 45, 'Mid'),
  ('calgary','retail',        52, 13.2, 42, 'Mid'),
  ('calgary','self_employed', 72,  8.5, 36, 'Low'),
  ('calgary','freelancer',    62, 10.6, 45, 'Low'),
  ('calgary','unemployed',    35, 22.0, 94, 'Low'),
  ('calgary','retired',       58, 13.1, 56, 'Low'),
  -- montreal
  ('montreal','electrician',   68,  5.5, 30, 'Mid'),
  ('montreal','software_eng',  70,  5.2, 28, 'Mid'),
  ('montreal','nurse',         65,  6.0, 32, 'Mid'),
  ('montreal','doctor',        78,  2.6, 10, 'Mid'),
  ('montreal','pharmacist',    68,  5.5, 22, 'Mid'),
  ('montreal','data_analyst',  64,  6.8, 26, 'Mid'),
  ('montreal','it_support',    55,  9.4, 36, 'Low'),
  ('montreal','engineer',      66,  6.3, 25, 'Mid'),
  ('montreal','plumber',       62,  7.5, 29, 'Mid'),
  ('montreal','carpenter',     55,  8.5, 33, 'Mid'),
  ('montreal','teacher',       68,  5.8, 30, 'Mid'),
  ('montreal','accountant',    62,  6.8, 34, 'Mid'),
  ('montreal','lawyer',        72,  4.5, 17, 'Mid'),
  ('montreal','police',        65,  6.5, 32, 'Mid'),
  ('montreal','firefighter',   64,  6.3, 31, 'Mid'),
  ('montreal','social_worker', 48, 10.0, 38, 'Mid'),
  ('montreal','truck_driver',  60,  7.2, 36, 'Mid'),
  ('montreal','mechanic',      56,  8.5, 33, 'Mid'),
  ('montreal','chef',          44, 11.2, 43, 'Low'),
  ('montreal','retail',        45, 13.5, 44, 'Low'),
  ('montreal','self_employed', 65,  8.9, 34, 'Low'),
  ('montreal','freelancer',    60, 11.2, 43, 'Low'),
  ('montreal','unemployed',    34, 23.2, 89, 'Low'),
  ('montreal','retired',       55, 13.8, 53, 'Low'),
  -- ottawa
  ('ottawa','electrician',   74,  6.8, 28, 'Mid'),
  ('ottawa','software_eng',  80,  6.2, 26, 'High'),
  ('ottawa','nurse',         82,  6.5, 27, 'High'),
  ('ottawa','doctor',        88,  3.0, 11, 'High'),
  ('ottawa','pharmacist',    78,  6.2, 24, 'Mid'),
  ('ottawa','data_analyst',  74,  7.6, 30, 'Mid'),
  ('ottawa','it_support',    64, 10.5, 41, 'Mid'),
  ('ottawa','engineer',      76,  7.1, 28, 'Mid'),
  ('ottawa','plumber',       70,  8.3, 33, 'Mid'),
  ('ottawa','carpenter',     62,  9.6, 38, 'Mid'),
  ('ottawa','teacher',       80,  7.0, 28, 'High'),
  ('ottawa','accountant',    74,  7.8, 30, 'Mid'),
  ('ottawa','lawyer',        84,  5.0, 19, 'High'),
  ('ottawa','police',        80,  6.8, 28, 'High'),
  ('ottawa','firefighter',   78,  6.5, 27, 'High'),
  ('ottawa','social_worker', 56, 11.2, 43, 'Mid'),
  ('ottawa','truck_driver',  65,  8.5, 34, 'Mid'),
  ('ottawa','mechanic',      62,  9.6, 38, 'Mid'),
  ('ottawa','chef',          46, 12.5, 48, 'Low'),
  ('ottawa','retail',        44, 16.0, 50, 'Low'),
  ('ottawa','self_employed', 65, 10.0, 39, 'Low'),
  ('ottawa','freelancer',    58, 12.5, 48, 'Low'),
  ('ottawa','unemployed',    32, 26.0,101, 'Low'),
  ('ottawa','retired',       52, 15.5, 60, 'Low'),
  -- seattle
  ('seattle','electrician',   78,  8.8, 32, 'High'),
  ('seattle','software_eng',  90,  5.8, 22, 'High'),
  ('seattle','nurse',         76,  9.2, 34, 'High'),
  ('seattle','doctor',        86,  4.5, 15, 'High'),
  ('seattle','pharmacist',    78,  7.8, 28, 'High'),
  ('seattle','data_analyst',  82,  7.2, 26, 'High'),
  ('seattle','it_support',    68, 10.5, 38, 'High'),
  ('seattle','engineer',      78,  8.2, 30, 'High'),
  ('seattle','plumber',       72,  9.5, 36, 'Mid'),
  ('seattle','carpenter',     64, 11.0, 42, 'Mid'),
  ('seattle','teacher',       68, 10.5, 38, 'Mid'),
  ('seattle','accountant',    72,  9.8, 36, 'Mid'),
  ('seattle','lawyer',        80,  7.0, 26, 'High'),
  ('seattle','police',        72,  9.0, 34, 'Mid'),
  ('seattle','firefighter',   70,  9.2, 35, 'Mid'),
  ('seattle','social_worker', 52, 13.5, 50, 'Mid'),
  ('seattle','truck_driver',  65, 10.8, 40, 'Mid'),
  ('seattle','mechanic',      60, 11.5, 44, 'Mid'),
  ('seattle','chef',          42, 15.0, 58, 'Mid'),
  ('seattle','retail',        35, 20.0, 60, 'Mid'),
  ('seattle','self_employed', 62, 12.0, 46, 'Low'),
  ('seattle','freelancer',    55, 15.0, 58, 'Low'),
  ('seattle','unemployed',    30, 32.0,110, 'Low'),
  ('seattle','retired',       48, 18.0, 68, 'Low'),
  -- san-francisco
  ('san-francisco','electrician',   58, 14.5, 52, 'High'),
  ('san-francisco','software_eng',  82,  8.2, 32, 'High'),
  ('san-francisco','nurse',         65, 13.0, 48, 'High'),
  ('san-francisco','doctor',        78,  6.8, 24, 'High'),
  ('san-francisco','pharmacist',    65, 12.5, 46, 'High'),
  ('san-francisco','data_analyst',  75, 10.5, 40, 'High'),
  ('san-francisco','it_support',    55, 16.0, 58, 'High'),
  ('san-francisco','engineer',      65, 12.0, 44, 'High'),
  ('san-francisco','plumber',       50, 16.5, 60, 'Mid'),
  ('san-francisco','carpenter',     44, 19.0, 70, 'Mid'),
  ('san-francisco','teacher',       48, 17.5, 65, 'Mid'),
  ('san-francisco','accountant',    55, 15.5, 58, 'Mid'),
  ('san-francisco','lawyer',        72,  9.5, 36, 'High'),
  ('san-francisco','police',        52, 16.0, 60, 'Mid'),
  ('san-francisco','firefighter',   50, 16.5, 62, 'Mid'),
  ('san-francisco','social_worker', 35, 22.0, 82, 'Mid'),
  ('san-francisco','truck_driver',  42, 18.0, 68, 'Mid'),
  ('san-francisco','mechanic',      40, 19.5, 72, 'Mid'),
  ('san-francisco','chef',          30, 26.0, 92, 'Mid'),
  ('san-francisco','retail',        22, 34.0, 95, 'Low'),
  ('san-francisco','self_employed', 48, 18.5, 72, 'Low'),
  ('san-francisco','freelancer',    40, 22.0, 85, 'Low'),
  ('san-francisco','unemployed',    18, 52.0,145, 'Low'),
  ('san-francisco','retired',       35, 28.0,100, 'Low'),
  -- new-york
  ('new-york','electrician',   55, 13.5, 48, 'High'),
  ('new-york','software_eng',  80,  8.0, 30, 'High'),
  ('new-york','nurse',         62, 12.5, 46, 'High'),
  ('new-york','doctor',        76,  6.5, 22, 'High'),
  ('new-york','pharmacist',    63, 12.0, 44, 'High'),
  ('new-york','data_analyst',  74, 10.0, 38, 'High'),
  ('new-york','it_support',    54, 15.5, 56, 'High'),
  ('new-york','engineer',      64, 11.5, 42, 'High'),
  ('new-york','plumber',       55, 14.5, 52, 'Mid'),
  ('new-york','carpenter',     46, 17.0, 62, 'Mid'),
  ('new-york','teacher',       52, 15.5, 58, 'Mid'),
  ('new-york','accountant',    60, 14.0, 52, 'High'),
  ('new-york','lawyer',        75,  8.5, 32, 'High'),
  ('new-york','police',        58, 14.0, 52, 'Mid'),
  ('new-york','firefighter',   56, 14.5, 54, 'Mid'),
  ('new-york','social_worker', 38, 20.0, 74, 'Mid'),
  ('new-york','truck_driver',  48, 16.5, 62, 'Mid'),
  ('new-york','mechanic',      44, 18.0, 68, 'Mid'),
  ('new-york','chef',          35, 23.5, 82, 'Mid'),
  ('new-york','retail',        25, 30.0, 88, 'Low'),
  ('new-york','self_employed', 45, 17.5, 68, 'Low'),
  ('new-york','freelancer',    38, 20.5, 78, 'Low'),
  ('new-york','unemployed',    20, 46.0,138, 'Low'),
  ('new-york','retired',       36, 26.0, 96, 'Low'),
  -- boston
  ('boston','electrician',   68, 10.5, 40, 'High'),
  ('boston','software_eng',  82,  7.0, 28, 'High'),
  ('boston','nurse',         74, 10.0, 38, 'High'),
  ('boston','doctor',        84,  5.5, 20, 'High'),
  ('boston','pharmacist',    74,  9.5, 35, 'High'),
  ('boston','data_analyst',  76,  8.5, 32, 'High'),
  ('boston','it_support',    62, 12.5, 46, 'High'),
  ('boston','engineer',      72,  9.8, 36, 'High'),
  ('boston','plumber',       65, 11.5, 44, 'Mid'),
  ('boston','carpenter',     57, 13.5, 51, 'Mid'),
  ('boston','teacher',       65, 12.0, 45, 'Mid'),
  ('boston','accountant',    68, 11.0, 42, 'Mid'),
  ('boston','lawyer',        78,  7.5, 28, 'High'),
  ('boston','police',        68, 10.5, 40, 'Mid'),
  ('boston','firefighter',   66, 11.0, 42, 'Mid'),
  ('boston','social_worker', 48, 15.0, 56, 'Mid'),
  ('boston','truck_driver',  58, 12.5, 48, 'Mid'),
  ('boston','mechanic',      55, 13.5, 52, 'Mid'),
  ('boston','chef',          40, 17.5, 65, 'Low'),
  ('boston','retail',        32, 22.5, 68, 'Low'),
  ('boston','self_employed', 58, 14.0, 54, 'Low'),
  ('boston','freelancer',    50, 17.5, 65, 'Low'),
  ('boston','unemployed',    26, 35.0,118, 'Low'),
  ('boston','retired',       44, 20.5, 76, 'Low')
ON CONFLICT (city_id, occupation_id) DO UPDATE SET
  score=EXCLUDED.score, hpi_years=EXCLUDED.hpi_years,
  rpi=EXCLUDED.rpi, eoi=EXCLUDED.eoi, updated_at=NOW();

COMMENT ON TABLE city_indices IS
  'City-level indices (EOI, TAI, HAI, EQI, TCI, PSI, EDI) and housing anchor data. '
  'Updated when new official data releases (CREA, Statistics Canada, etc.).';

COMMENT ON TABLE city_occupation_scores IS
  'Per-city per-occupation City Fit Score, Years-to-Buy (HPI), Rent Pressure Index, and EOI tier. '
  'Core data for /ranking and /compare pages. Update monthly with new data releases.';
