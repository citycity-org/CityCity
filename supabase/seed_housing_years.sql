-- ─────────────────────────────────────────────────────────────
-- 补全 housing_years 数据
-- 前提：已运行 add_purpose_column.sql
-- ─────────────────────────────────────────────────────────────
-- 现有数据：150 行（5城市 × 30职业 × 2br_condo × buy）
-- 本文件新增：
--   买房 buy：4种缺失房型 × 150 = 600 行（从 2br_condo 按价格比例推导）
--   租房 rent：5种房型 × 5城市 × 30职业 = 750 行（用月租金 / 月薪计算）
-- ─────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════
-- PART 1：补全 BUY 的其余 4 种房型
-- 价格倍数来源：app/city/[slug]/page.tsx PROPERTY_TYPES.multiplier
--   1br=0.72  2br=1.00  3br=1.28  townhouse=1.55  house=2.10
-- 历史年数直接按同比例缩放（价格变化同步，薪资基准相同）
-- ══════════════════════════════════════════════════════════════

INSERT INTO housing_years (city_id, occupation_id, property_type, purpose, years_current, years_2019, years_1995)
SELECT city_id, occupation_id, '1br_condo', 'buy',
  ROUND(years_current * 0.72, 2),
  ROUND(COALESCE(years_2019, years_current * 0.83) * 0.72, 2),
  ROUND(COALESCE(years_1995, years_current * 0.35) * 0.72, 2)
FROM housing_years
WHERE property_type = '2br_condo' AND purpose = 'buy'
ON CONFLICT (city_id, occupation_id, property_type, purpose) DO NOTHING;

INSERT INTO housing_years (city_id, occupation_id, property_type, purpose, years_current, years_2019, years_1995)
SELECT city_id, occupation_id, '3br_condo', 'buy',
  ROUND(years_current * 1.28, 2),
  ROUND(COALESCE(years_2019, years_current * 0.83) * 1.28, 2),
  ROUND(COALESCE(years_1995, years_current * 0.35) * 1.28, 2)
FROM housing_years
WHERE property_type = '2br_condo' AND purpose = 'buy'
ON CONFLICT (city_id, occupation_id, property_type, purpose) DO NOTHING;

INSERT INTO housing_years (city_id, occupation_id, property_type, purpose, years_current, years_2019, years_1995)
SELECT city_id, occupation_id, 'townhouse', 'buy',
  ROUND(years_current * 1.55, 2),
  ROUND(COALESCE(years_2019, years_current * 0.83) * 1.55, 2),
  ROUND(COALESCE(years_1995, years_current * 0.35) * 1.55, 2)
FROM housing_years
WHERE property_type = '2br_condo' AND purpose = 'buy'
ON CONFLICT (city_id, occupation_id, property_type, purpose) DO NOTHING;

INSERT INTO housing_years (city_id, occupation_id, property_type, purpose, years_current, years_2019, years_1995)
SELECT city_id, occupation_id, 'house', 'buy',
  ROUND(years_current * 2.10, 2),
  ROUND(COALESCE(years_2019, years_current * 0.83) * 2.10, 2),
  ROUND(COALESCE(years_1995, years_current * 0.35) * 2.10, 2)
FROM housing_years
WHERE property_type = '2br_condo' AND purpose = 'buy'
ON CONFLICT (city_id, occupation_id, property_type, purpose) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- PART 2：插入全部 RENT 数据（750 行）
-- 指标含义：月租金 ÷ 税前月薪 × 100 = 租金占收入百分比（%）
--
-- 基准月租金（2br_condo, 2026 Q1 市场行情，CAD/月）：
--   温哥华 3200 / 多伦多 3000 / 卡尔加里 1900
--   蒙特利尔 1900 / 渥太华 2200
--
-- 各房型租金倍数（相对 2br_condo）：
--   1br 0.76 / 2br 1.00 / 3br 1.30 / 联排 1.22 / 独立屋 1.48
--
-- 历史折算（租金变化 / 薪资变化）：
--   2019：租金约为现在 78%，薪资约 85% → 比值 × 0.918
--   1995：租金约为现在 38%，薪资约 52% → 比值 × 0.731
-- ══════════════════════════════════════════════════════════════

WITH
base_rent (city_id, monthly_rent_2br) AS (
  VALUES
    ('vancouver'::text,  3200),
    ('toronto',          3000),
    ('calgary',          1900),
    ('montreal',         1900),
    ('ottawa',           2200)
),
prop_mult (property_type, rent_mult) AS (
  VALUES
    ('1br_condo'::text,  0.76::numeric),
    ('2br_condo',        1.00),
    ('3br_condo',        1.30),
    ('townhouse',        1.22),
    ('house',            1.48)
),
occ_salary (occupation_id, annual_salary) AS (
  VALUES
    ('nurse'::text,              85000),
    ('software_eng',            110000),
    ('teacher',                  78000),
    ('electrician',              82000),
    ('truck_driver',             68000),
    ('accountant',               72000),
    ('police',                   88000),
    ('chef',                     52000),
    ('retail',                   42000),
    ('engineer',                 95000),
    ('doctor',                  220000),
    ('pharmacist',              110000),
    ('dentist',                 180000),
    ('lawyer',                  130000),
    ('financial_advisor',        90000),
    ('real_estate',              75000),
    ('mechanic',                 62000),
    ('carpenter',                68000),
    ('plumber',                  75000),
    ('welder',                   65000),
    ('it_support',               62000),
    ('data_analyst',             85000),
    ('marketing',                65000),
    ('hr',                       62000),
    ('social_worker',            58000),
    ('firefighter',              92000),
    ('pilot',                   180000),
    ('chef_executive',           72000),
    ('security',                 42000),
    ('cleaner',                  36000)
)
INSERT INTO housing_years
  (city_id, occupation_id, property_type, purpose, years_current, years_2019, years_1995)
SELECT
  b.city_id,
  o.occupation_id,
  p.property_type,
  'rent',
  -- 2026：月租金 / 月薪 × 100
  ROUND(
    (b.monthly_rent_2br * p.rent_mult) / (o.annual_salary::numeric / 12.0) * 100.0,
    1
  ),
  -- 2019
  ROUND(
    (b.monthly_rent_2br * p.rent_mult * 0.78) / (o.annual_salary::numeric * 0.85 / 12.0) * 100.0,
    1
  ),
  -- 1995
  ROUND(
    (b.monthly_rent_2br * p.rent_mult * 0.38) / (o.annual_salary::numeric * 0.52 / 12.0) * 100.0,
    1
  )
FROM base_rent b
CROSS JOIN prop_mult p
CROSS JOIN occ_salary o
ON CONFLICT (city_id, occupation_id, property_type, purpose) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- 验证（执行后应看到以下结果）
-- ══════════════════════════════════════════════════════════════
-- SELECT purpose, property_type, count(*)
-- FROM housing_years
-- GROUP BY 1, 2
-- ORDER BY 1, 2;
--
-- 预期输出：
-- buy  | 1br_condo | 150
-- buy  | 2br_condo | 150   ← 原有数据
-- buy  | 3br_condo | 150
-- buy  | house     | 150
-- buy  | townhouse | 150
-- rent | 1br_condo | 150
-- rent | 2br_condo | 150
-- rent | 3br_condo | 150
-- rent | house     | 150
-- rent | townhouse | 150
-- 总计：1500 行
