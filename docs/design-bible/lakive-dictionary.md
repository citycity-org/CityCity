# Lakive Dictionary™

**Version:** 1.0  
**Established:** August 2026  
**Status:** Canonical — all Lakive reports reference this document

All terms defined here are Lakive proprietary. They are not re-defined within individual reports. First use in any report should cite this dictionary or lakive.com/dictionary.

---

## Index Definitions

### HEY — Housing Entry Barrier

| Field | Value |
|-------|-------|
| **Abbreviation** | HEY |
| **Full name** | Housing Entry Barrier |
| **Unit** | Years |
| **Type** | Occupation-composited, city-level index |

**Definition:** The number of years required for a median-income household to save a 20% down payment on a 2-bedroom benchmark property in a given city.

**Formula:** `(Benchmark 2BR price × 0.20) ÷ (median occupation income after tax × savings rate)`

**Interpretation:** Lower is better. HEY = 4 means approximately 4 years of disciplined saving to reach ownership. HEY = 13 means 13 years.

**In the Lakive City Matrix™:** X-axis (horizontal). Lower HEY = further left = more accessible.

**Citation format:** "HEY = 13.0 years" or "a Housing Entry Barrier of 13.0 years". Never cite a HEY value without the unit.

**Notes:** HEY is calculated per occupation. The city-level composite uses a weighted basket of representative occupations. The barrier is the concept; years is the unit of measurement.

---

### LAS — Lifestyle Appeal Score

| Field | Value |
|-------|-------|
| **Abbreviation** | LAS |
| **Full name** | Lifestyle Appeal Score |
| **Unit** | Score (0–100) |
| **Type** | City-level composite index |

**Definition:** Lakive's composite measure of a city's long-term quality of life across four equal-weight pillars.

**Components (25% each):**
- Climate (liveability, seasonal range)
- Cultural Density (amenities, arts, dining, diversity)
- Infrastructure (transit, healthcare access, public services)
- Global Recognition (international connectivity, institutional presence)

**Interpretation:** Higher is better. A score of 84 reflects strong performance across all four pillars. A score of 50 reflects more modest performance on one or more pillars, offset by strengths elsewhere.

**In the Lakive City Matrix™:** Y-axis (vertical). Higher LAS = higher on the chart = more appealing.

**Chart label convention:** Use "Lifestyle Appeal" on axis labels. Use full name "Lifestyle Appeal Score (LAS)" in methodology notes and footnotes.

**Notes:** LAS is a city-level metric, not occupation-specific. Future refinement may introduce sector-weighted variants.

---

### RPI — Rent Pressure Index

| Field | Value |
|-------|-------|
| **Abbreviation** | RPI |
| **Full name** | Rent Pressure Index |
| **Unit** | % |
| **Type** | Occupation-specific, city-level index |

**Definition:** The share of gross annual household income required to cover annual rent at the benchmark unit price for a given city and housing type.

**Formula:** `RPI = (Annual Rent ÷ Gross Annual Household Income) × 100%`

**Example:** Monthly rent $3,000, gross annual income $100,000 → RPI = (3,000 × 12) ÷ 100,000 = 36%

**Interpretation:** Lower is better. The widely-used affordability threshold is 30%. RPI below 30% = affordable; 30–40% = moderate pressure; above 40% = high pressure; above 55% = severe.

**Citation format:** "RPI = 36%" or "a Rent Pressure Index of 36%". Always include the % unit.

**Notes:** RPI is calculated per occupation using median gross income. It measures gross rent burden, not after-tax. Use alongside HEY to give a complete picture of housing affordability: HEY reflects the path to ownership; RPI reflects the ongoing rental cost burden.

---

### EOI — Employment Opportunity Index

| Field | Value |
|-------|-------|
| **Abbreviation** | EOI |
| **Full name** | Employment Opportunity Index |
| **Unit** | Index (0–100, relative) |
| **Type** | Occupation-specific, city-level index |

**Definition:** Lakive's occupation-specific measure of employment demand in a given city, combining job vacancy rates, wage growth trajectory, and sector size.

**Interpretation:** Higher is better. Values are relative within a comparison set — EOI 92 indicates stronger demand than EOI 65. Not an absolute measure; do not compare EOI values across different report editions without normalisation notes.

**In the Lakive City Matrix™:** Bubble size. Larger bubble = stronger employment demand.

**Notes:** EOI is calculated per occupation. The city-level composite uses a representative basket. The legend always shows three reference bubbles (small / medium / large) labelled "Employment demand".

---

## Framework Definitions

### The Lakive City Matrix™

**Type:** Branded analytical framework  
**First published:** August 2026  

**Definition:** Lakive's Signature Framework for comparing cities across the three dimensions that matter most to long-term settlement decisions: Housing Entry Barrier (HEY), Lifestyle Appeal Score (LAS), and Employment Opportunity Index (EOI). Rendered as a bubble chart in which HEY is the X-axis, LAS is the Y-axis, and bubble size encodes EOI. Median reference lines divide the chart into four named quadrants.

**The ™ symbol is mandatory** in all formal contexts — reports, web, social, presentations. Omit only in code variable names.

---

## Quadrant Definitions

Quadrants are defined by the median HEY and median LAS of the comparison set. They shift as new cities are added.

### Global Gems

**Position:** Upper-left (low HEY, high LAS)  
**Criteria:** Below-median Housing Entry Barrier + above-median Lifestyle Appeal  
**Definition:** Cities combining high lifestyle appeal with relatively accessible housing — the most desirable quadrant for long-term settlement across the widest range of occupations.

---

### Aspirational Cities

**Position:** Upper-right (high HEY, high LAS)  
**Criteria:** Above-median Housing Entry Barrier + above-median Lifestyle Appeal  
**Definition:** Highly desirable cities with above-median housing entry barriers. Strong lifestyle appeal at a financial cost that may not be recoverable within a standard career horizon for many occupations.

---

### Settlement Sweet Spot

**Position:** Lower-left (low HEY, low LAS)  
**Criteria:** Below-median Housing Entry Barrier + below-median Lifestyle Appeal  
**Definition:** Cities with below-median housing barriers and practical long-term settlement potential. Lifestyle appeal is moderate, but the financial foundation for ownership and stability is more accessible — often the best quadrant for trades, healthcare, and public-sector occupations.

---

### High-Cost Trade-off

**Position:** Lower-right (high HEY, low LAS)  
**Criteria:** Above-median Housing Entry Barrier + below-median Lifestyle Appeal  
**Definition:** Cities with above-median housing barriers without proportionally higher lifestyle appeal. The cost of entry is elevated without a commensurate return on quality of life.

---

## Usage Rules

1. **All Lakive reports reference this dictionary.** Terms defined here require no in-body re-definition. A footnote or link to lakive.com/dictionary suffices on first use.
2. **Abbreviations are always uppercase** — HEY, LAS, EOI. Never hey, las, eoi.
3. **Full names use title case** — Housing Entry Barrier, Lifestyle Appeal Score, Employment Opportunity Index.
4. **Always state the unit with HEY values** — "13.0 years" or "HEY = 13.0 years". Never "HEY = 13.0" alone.
5. **The ™ symbol is mandatory** on "The Lakive City Matrix™" in all formal contexts.
6. **Quadrant names use title case and are never modified** — Global Gems, Aspirational Cities, Settlement Sweet Spot, High-Cost Trade-off. Do not paraphrase or abbreviate in publication.
7. **Report review rule:** All reports using Lakive Dictionary™ terms must be reviewed by the editorial team before web or PDF publication.

---

## Proposed Extensions (Pending Approval)

The following terms are under consideration for V1.1:

- **Workcation Index** — a visitor-oriented composite (broadband, accommodation, climate, co-working access), distinct from LAS
- **Settlement Score** — a weighted combination of HEY, LAS, and EOI calibrated per occupation, producing a single settlement suitability ranking
- **HEY Occupation Band** — a range showing minimum and maximum HEY across the representative occupation basket for a city, replacing the single composite figure

---

*Lakive Dictionary™ is maintained by Lakive Research.*  
*Version 1.0 — Established August 2026*
