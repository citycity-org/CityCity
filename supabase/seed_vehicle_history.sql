-- ─────────────────────────────────────────────────────────────
-- 补全 vehicle_months 历史数据
-- 前提：vehicle_months 表已有 months_current 数据
-- 算法：
--   months_2019 = months_current × 0.75（2019年车价/薪资比更低）
--   months_1995 = months_current × 0.45（1995年车价/薪资比更低）
-- ─────────────────────────────────────────────────────────────

UPDATE vehicle_months
SET
  months_2019 = ROUND(months_current * 0.75, 2),
  months_1995 = ROUND(months_current * 0.45, 2)
WHERE
  months_current IS NOT NULL
  AND (months_2019 = 0 OR months_2019 IS NULL OR months_1995 = 0 OR months_1995 IS NULL);
