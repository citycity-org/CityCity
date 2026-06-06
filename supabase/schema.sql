-- CityCity.org · Supabase Schema
-- 城市生活成本对比平台 · 数据库建表语句
-- 执行顺序：cities → occupations → housing_years → vehicle_months

-- ─────────────────────────────────────────────
-- 1. cities · 城市基础信息 + 七维指数
-- ─────────────────────────────────────────────
CREATE TABLE cities (
  id                TEXT PRIMARY KEY,        -- 'vancouver' | 'toronto' | 'calgary' | 'montreal' | 'ottawa'
  name_zh           TEXT NOT NULL,           -- 中文名
  name_en           TEXT NOT NULL,           -- 英文名
  province          TEXT NOT NULL,           -- 'British Columbia'
  province_short    TEXT NOT NULL,           -- 'BC'

  -- 房价基准（2br_condo 中位数，单位：CAD）
  base_price        INTEGER NOT NULL,

  -- 税务参数
  property_tax_rate NUMERIC(8, 5) NOT NULL,  -- 年房产税率，如 0.00278

  -- 综合指数（/100）
  score             SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),

  -- 七维指数
  -- HPI：注册护士 × 2居室公寓 基准买房年数
  hpi_years         NUMERIC(5, 2) NOT NULL,
  -- RPI：中位数租金占中位数税前月收入百分比（%）
  rpi               NUMERIC(5, 1) NOT NULL,
  -- CPI：中位数薪资购买 Honda Civic 所需月数
  cpi               NUMERIC(5, 1) NOT NULL,
  -- 环境/教育/医疗/交通 各 /10
  eqi               SMALLINT NOT NULL CHECK (eqi BETWEEN 0 AND 10),
  edi               SMALLINT NOT NULL CHECK (edi BETWEEN 0 AND 10),
  hci               SMALLINT NOT NULL CHECK (hci BETWEEN 0 AND 10),
  tci               SMALLINT NOT NULL CHECK (tci BETWEEN 0 AND 10),

  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO cities (id, name_zh, name_en, province, province_short, base_price, property_tax_rate, score, hpi_years, rpi, cpi, eqi, edi, hci, tci) VALUES
  ('vancouver', '温哥华', 'Vancouver',  'British Columbia', 'BC', 880000, 0.00278, 38, 10.2, 43.6, 7.6, 9, 8, 7, 8),
  ('toronto',   '多伦多', 'Toronto',    'Ontario',          'ON', 820000, 0.00715, 41,  9.6, 41.2, 7.2, 7, 8, 7, 9),
  ('calgary',   '卡尔加里','Calgary',   'Alberta',          'AB', 520000, 0.00657, 74,  3.9, 24.1, 4.8, 8, 8, 8, 6),
  ('montreal',  '蒙特利尔','Montréal',  'Québec',           'QC', 580000, 0.00531, 55,  7.4, 30.2, 6.8, 7, 7, 6, 8),
  ('ottawa',    '渥太华', 'Ottawa',     'Ontario',          'ON', 620000, 0.01230, 62,  6.8, 28.4, 6.2, 8, 9, 8, 7);


-- ─────────────────────────────────────────────
-- 2. occupations · 职业参考表
-- ─────────────────────────────────────────────
CREATE TABLE occupations (
  id              TEXT PRIMARY KEY,       -- 'nurse' | 'software_eng' | ...
  name_zh         TEXT NOT NULL,          -- 中文职业名
  industry_zh     TEXT NOT NULL,          -- 行业
  annual_salary   INTEGER NOT NULL,       -- 全国中位数税前年薪（CAD），来源 StatCan NOC 2021

  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO occupations (id, name_zh, industry_zh, annual_salary) VALUES
  ('nurse',            '注册护士',     '医疗',     85000),
  ('software_eng',     '软件工程师',   '科技',    110000),
  ('teacher',          '中学教师',     '教育',     78000),
  ('electrician',      '电工',         '建筑',     82000),
  ('truck_driver',     '卡车司机',     '运输',     68000),
  ('accountant',       '会计师',       '金融',     72000),
  ('police',           '警察',         '公共服务', 88000),
  ('chef',             '厨师',         '餐饮',     52000),
  ('retail',           '零售店员',     '零售',     42000),
  ('engineer',         '土木工程师',   '建筑',     95000),
  ('doctor',           '家庭医生',     '医疗',    220000),
  ('pharmacist',       '药剂师',       '医疗',    110000),
  ('dentist',          '牙医',         '医疗',    180000),
  ('lawyer',           '律师',         '法律',    130000),
  ('financial_advisor','财务顾问',     '金融',     90000),
  ('real_estate',      '房产经纪',     '房产',     75000),
  ('mechanic',         '汽车技师',     '汽车',     62000),
  ('carpenter',        '木工',         '建筑',     68000),
  ('plumber',          '水管工',       '建筑',     75000),
  ('welder',           '焊工',         '制造',     65000),
  ('it_support',       'IT技术支持',   '科技',     62000),
  ('data_analyst',     '数据分析师',   '科技',     85000),
  ('marketing',        '市场营销专员', '商业',     65000),
  ('hr',               '人力资源专员', '商业',     62000),
  ('social_worker',    '社会工作者',   '社会服务', 58000),
  ('firefighter',      '消防员',       '公共服务', 92000),
  ('pilot',            '商业飞行员',   '航空',    180000),
  ('chef_executive',   '行政总厨',     '餐饮',     72000),
  ('security',         '保安',         '保安',     42000),
  ('cleaner',          '清洁工',       '服务',     36000);


-- ─────────────────────────────────────────────
-- 3. housing_years · 买房 / 租房负担年数
--    city × occupation × property_type × purpose
-- ─────────────────────────────────────────────
-- property_type: '1br_condo' | '2br_condo' | '3br_condo' | 'townhouse' | 'house'
-- purpose:       'buy' | 'rent'
--
-- buy  → years_current = 税前年薪存满20%首付后，还清25年贷款所需工作年数
-- rent → years_current = 月租金占税前月薪百分比（如 43.6 = 43.6%）
-- ─────────────────────────────────────────────
CREATE TABLE housing_years (
  id            SERIAL PRIMARY KEY,
  city_id       TEXT NOT NULL REFERENCES cities(id),
  occupation_id TEXT NOT NULL REFERENCES occupations(id),
  property_type TEXT NOT NULL CHECK (property_type IN ('1br_condo','2br_condo','3br_condo','townhouse','house')),
  purpose       TEXT NOT NULL CHECK (purpose IN ('buy','rent')),

  years_current NUMERIC(6, 2) NOT NULL,  -- 2026 Q1
  years_2019    NUMERIC(6, 2),           -- 2019 基准
  years_1995    NUMERIC(6, 2),           -- 1995 历史

  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (city_id, occupation_id, property_type, purpose)
);

CREATE INDEX idx_housing_lookup
  ON housing_years (city_id, occupation_id, property_type, purpose);


-- ─────────────────────────────────────────────
-- 4. vehicle_months · 买车负担月数
--    city × occupation × vehicle_id
-- ─────────────────────────────────────────────
-- months_current = 按 Edmunds 20/4/10 规则（首付20%+4年还清+月供≤税后10%）
--                  得出所需工作月数
-- ─────────────────────────────────────────────
CREATE TABLE vehicle_months (
  id            SERIAL PRIMARY KEY,
  city_id       TEXT NOT NULL REFERENCES cities(id),
  occupation_id TEXT NOT NULL REFERENCES occupations(id),
  vehicle_id    TEXT NOT NULL,           -- 'honda_civic' | 'toyota_rav4' | ...

  months_current NUMERIC(5, 2) NOT NULL, -- 2026
  months_2019    NUMERIC(5, 2),          -- 2019
  months_1995    NUMERIC(5, 2),          -- 1995

  updated_at     TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (city_id, occupation_id, vehicle_id)
);

CREATE INDEX idx_vehicle_lookup
  ON vehicle_months (city_id, occupation_id, vehicle_id);


-- ─────────────────────────────────────────────
-- Row Level Security（建议开启后配置）
-- ─────────────────────────────────────────────
ALTER TABLE cities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_years  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_months ENABLE ROW LEVEL SECURITY;

-- 匿名用户只读
CREATE POLICY "anon_read_cities"         ON cities         FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_occupations"    ON occupations    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_housing_years"  ON housing_years  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_vehicle_months" ON vehicle_months FOR SELECT TO anon USING (true);
