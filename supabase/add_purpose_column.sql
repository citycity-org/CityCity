-- ─────────────────────────────────────────────────────────────
-- 迁移：给 housing_years 加 purpose 列
-- 执行顺序：先运行本文件，再运行 seed_housing_years.sql
-- ─────────────────────────────────────────────────────────────

-- 1. 加列，DEFAULT 'buy' 保证现有 150 行自动归为 buy，不丢数据
ALTER TABLE housing_years
ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'buy';

-- 2. 加值域约束（幂等：先检查是否已存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'housing_years_purpose_check'
  ) THEN
    ALTER TABLE housing_years
    ADD CONSTRAINT housing_years_purpose_check
    CHECK (purpose IN ('buy', 'rent'));
  END IF;
END $$;

-- 3. 加唯一约束（seed SQL 用 ON CONFLICT 依赖此约束）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'housing_years_unique_lookup'
  ) THEN
    ALTER TABLE housing_years
    ADD CONSTRAINT housing_years_unique_lookup
    UNIQUE (city_id, occupation_id, property_type, purpose);
  END IF;
END $$;

-- 4. 查询索引
CREATE INDEX IF NOT EXISTS idx_housing_years_lookup
  ON housing_years (city_id, occupation_id, property_type, purpose);

-- 验证结果（可选执行）
-- SELECT purpose, property_type, count(*) FROM housing_years GROUP BY 1,2 ORDER BY 1,2;
