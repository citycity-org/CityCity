# Vancouver 2026 Report — Verified Salary & Affordability Data

> **Status: DRAFT — Awaiting user review before publishing to website or PDF**
> Generated: 2026-07-10 | Source: Government of Canada Job Bank, Statistics Canada, CIHI

---

## Step 2 — Verified Salaries (Job Bank Official Data)

All hourly wages converted to annual using **37.5 h × 52 w = 1,950 h/year**.
Regional scope: **Lower Mainland–Southwest Region** (region code 39070), unless noted.

| Occupation | NOC | Median $/hr | Annual Gross | Data Source | Period |
|---|---|---|---|---|---|
| Family Physician / GP | 31102 | — | **$160,960/yr** | CIHI/CMA (BC prov. only; no regional) | 2023-2024 |
| Lawyer | 41101 | $66.65 | **$129,968** | LFS Statistics Canada | 2023-2024 |
| Software Developer | 21232 | $52.40 | **$102,180** | LFS Statistics Canada | 2023-2024 |
| Pharmacist | 31120 | $50.00 | **$97,500** | LFS Statistics Canada | 2023-2024 |
| Civil Engineer | 21300 | $49.74 | **$96,993** | Small Area Estimation | 2024 |
| Registered Nurse | 31301 | $47.54 | **$92,703** | LFS Statistics Canada | 2023-2024 |
| Data Analyst | 21223 | $44.71 | **$87,185** | LFS Statistics Canada | 2023-2024 |
| Secondary School Teacher | 41220 | $44.33 | **$86,444** | LFS Statistics Canada | 2023-2024 |
| Dentist ⚠️ | 31110 | — | **$78,000/yr** | 2021 Census (outdated; self-emp income likely understated) | **2021** |
| Social Worker | 41300 | $36.92 | **$71,994** | LFS Statistics Canada | 2023-2024 |
| Electrician | 72200 | $34.57 | **$67,412** | Small Area Estimation | 2024 |
| Retail Sales Associate | 64100 | $19.00 | **$37,050** | LFS Statistics Canada | 2023-2024 |

⚠️ **Data quality notes:**
- **Family Physician**: Annual earnings data only; no Lower Mainland regional breakdown available. BC provincial median ($160,960) is from CIHI/CMA and represents gross clinical income. Current `_data.ts` uses $230,000 — discrepancy should be discussed before updating.
- **Dentist**: 2021 Census data is 3–4 years old and significantly understates actual income for incorporated dentists. Job Bank acknowledges this. Real median for a working Vancouver dentist is likely $150,000–$220,000. Consider using BC Dental Association or CIHI source.

---

## Step 3 — 2026 BC After-Tax Income

**Tax parameters used:**
- **Federal**: 14%/20.5%/26%/29%/33%; BPA $16,452; reduced to $14,829 for incomes >$181,440
- **BC Provincial (2026)**: 5.6%/7.7%/10.5%/12.29%/14.7%/16.8%/20.5%; BPA $13,216
- **CPP**: Max pensionable $74,600; basic exemption $3,500; rate 5.95%; max contribution $4,230.45
- **EI**: Rate $1.63/$100 insurable; max insurable $68,900; max premium $1,123.07
- **Assumption**: T4 salaried employee (no RRSP, union dues, or other deductions)

| Occupation | Gross | CPP | EI | Federal Tax | BC Tax | **After-Tax (BC)** | Effective Rate |
|---|---|---|---|---|---|---|---|
| Family Physician / GP | $160,960 | $4,230 | $1,123 | $28,555 | $13,289 | **$113,762** | 29.3% |
| Lawyer | $129,968 | $4,230 | $1,123 | $20,497 | $8,985 | **$95,132** | 26.8% |
| Software Developer | $102,180 | $4,230 | $1,123 | $14,090 | $5,811 | **$76,925** | 24.7% |
| Pharmacist | $97,500 | $4,230 | $1,123 | $13,131 | $5,410 | **$73,606** | 24.5% |
| Civil Engineer | $96,993 | $4,230 | $1,123 | $13,027 | $5,371 | **$73,242** | 24.5% |
| Registered Nurse | $92,703 | $4,230 | $1,123 | $12,147 | $5,041 | **$70,162** | 24.3% |
| Data Analyst | $87,184 | $4,230 | $1,123 | $11,016 | $4,616 | **$66,199** | 24.1% |
| Secondary School Teacher | $86,444 | $4,230 | $1,123 | $10,864 | $4,559 | **$65,668** | 24.0% |
| Dentist ⚠️ | $78,000 | $4,230 | $1,123 | $9,133 | $3,908 | **$59,605** | 23.6% |
| Social Worker | $71,994 | $4,075 | $1,123 | $7,924 | $3,455 | **$55,417** | 23.0% |
| Electrician | $67,412 | $3,803 | $1,099 | $7,026 | $3,119 | **$52,366** | 22.3% |
| Retail Sales Associate | $37,050 | $1,996 | $604 | $2,520 | $1,189 | **$30,741** | 17.0% |

---

## Step 4 — Vancouver Affordability Metrics (5-Level System)

**Vancouver parameters**: benchmarkHpi = 16.2 | benchmarkSalary = $75,000 | avgRent2BR = $3,100/mo  
**Formula**: HPI Years = 16.2 × (75,000 / salary) | RPI = (3,100 × 12 / salary) × 100

**5-Level Rating** = max(HPI level, RPI level)  
- L1 Best Fit: HPI ≤ 5 yrs, RPI ≤ 25%  
- L2 Affordable: HPI ≤ 8 yrs, RPI ≤ 30%  
- L3 Manageable: HPI ≤ 12 yrs, RPI ≤ 38%  
- L4 Stretched: HPI ≤ 18 yrs, RPI ≤ 50%  
- L5 Very Difficult: HPI > 18 yrs OR RPI > 50%

| Occupation | Gross | After-Tax | HPI Yrs | RPI (Gross) | RPI (After-Tax) | **Rating** |
|---|---|---|---|---|---|---|
| Family Physician / GP ⚠️ | $160,960 | $113,762 | 7.5 | 23.1% | 32.7% | **L2 Affordable** |
| Lawyer | $129,968 | $95,132 | 9.3 | 28.6% | 39.1% | **L3 Manageable** |
| Software Developer | $102,180 | $76,925 | 11.9 | 36.4% | 48.4% | **L3 Manageable** |
| Pharmacist | $97,500 | $73,606 | 12.5 | 38.2% | 50.5% | **L4 Stretched** |
| Civil Engineer | $96,993 | $73,242 | 12.5 | 38.4% | 50.8% | **L4 Stretched** |
| Registered Nurse | $92,703 | $70,162 | 13.1 | 40.1% | 53.0% | **L4 Stretched** |
| Data Analyst | $87,185 | $66,199 | 13.9 | 42.7% | 56.2% | **L4 Stretched** |
| Secondary School Teacher | $86,444 | $65,668 | 14.1 | 43.0% | 56.6% | **L4 Stretched** |
| Dentist ⚠️ | $78,000 | $59,605 | 15.6 | 47.7% | 62.4% | **L4 Stretched** |
| Social Worker | $71,994 | $55,417 | 16.9 | 51.7% | 67.1% | **L5 Very Difficult** |
| Electrician | $67,412 | $52,366 | 18.0 | 55.2% | 71.0% | **L5 Very Difficult** |
| Retail Sales Associate | $37,050 | $30,741 | 32.8 | 100.4% | 121.0% | **L5 Very Difficult** |

---

## Calgary Comparison

**Calgary parameters**: benchmarkHpi = 8.5 | benchmarkSalary = $75,000 | avgRent2BR = $1,900/mo  
**After-tax uses Alberta 2026 rates**: 10/12/13/14/15%; BPA $21,003; NO PST

| Occupation | Gross | After-Tax (AB) | HPI Yrs | RPI (Gross) | RPI (After-Tax) | **Rating** |
|---|---|---|---|---|---|---|
| Family Physician / GP | $160,960 | $113,337 | 4.0 | 14.2% | 20.1% | **L1 Best Fit** |
| Lawyer | $129,968 | $93,756 | 4.9 | 17.5% | 24.3% | **L1 Best Fit** |
| Software Developer | $102,180 | $75,154 | 6.2 | 22.3% | 30.3% | **L2 Affordable** |
| Pharmacist | $97,500 | $71,901 | 6.5 | 23.4% | 31.7% | **L2 Affordable** |
| Civil Engineer | $96,993 | $71,549 | 6.6 | 23.5% | 31.9% | **L2 Affordable** |
| Registered Nurse | $92,703 | $68,567 | 6.9 | 24.6% | 33.3% | **L2 Affordable** |
| Data Analyst | $87,185 | $64,732 | 7.3 | 26.2% | 35.2% | **L2 Affordable** |
| Secondary School Teacher | $86,444 | $64,217 | 7.4 | 26.4% | 35.5% | **L2 Affordable** |
| Dentist ⚠️ | $78,000 | $58,349 | 8.2 | 29.2% | 39.1% | **L3 Manageable** |
| Social Worker | $71,994 | $54,293 | 8.9 | 31.7% | 42.0% | **L3 Manageable** |
| Electrician | $67,412 | $51,334 | 9.5 | 33.8% | 44.4% | **L3 Manageable** |
| Retail Sales Associate | $37,050 | $30,585 | 17.2 | 61.5% | 74.5% | **L5 Very Difficult** |

---

## Discrepancies vs. Current `_data.ts`

| Occupation | _data.ts salary | Job Bank verified | Difference |
|---|---|---|---|
| Family Physician | $230,000 | $160,960 | -$69,040 (-30%) ⚠️ |
| Registered Nurse | $84,000 | $92,703 | +$8,703 (+10%) |
| Software Developer | $110,000 | $102,180 | -$7,820 (-7%) |
| Pharmacist | $105,000 | $97,500 | -$7,500 (-7%) |
| Civil Engineer | $90,000 | $96,993 | +$6,993 (+8%) |
| Lawyer | $130,000 | $129,968 | ≈ same ✓ |
| Data Analyst | $80,000 | $87,185 | +$7,185 (+9%) |
| Secondary Teacher | $78,000 | $86,444 | +$8,444 (+11%) |
| Dentist | $185,000 | $78,000 | -$107,000 (-58%) ⚠️⚠️ (2021 Census data unreliable) |
| Social Worker | $65,000 | $71,994 | +$6,994 (+11%) |
| Electrician | $82,000 | $67,412 | -$14,588 (-18%) |
| Retail Associate | $42,000 | $37,050 | -$4,950 (-12%) |

**Key decision needed on Dentist salary**: The 2021 Census figure ($78,000) is clearly outdated and unreliable for self-employed dentists operating through professional corporations. Please advise whether to use the Job Bank figure with caveat, or use an alternative source (e.g., CDA/BCDA data, CIHI).

---

*Data compiled 2026-07-10. All figures in CAD. Not for publication until user review and approval.*
