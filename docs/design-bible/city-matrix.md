# The Lakive City Matrix™ — Design & Methodology Standard

**Version:** 1.0  
**Established:** August 2026  
**Status:** Canonical — do not modify without sign-off

---

## Overview

The Lakive City Matrix™ is Lakive's Signature Framework for comparing cities across the three dimensions that matter most to people making long-term settlement decisions. It is not a generic scatter plot or bubble chart — it is a named, branded analytical lens with fixed axis conventions, quadrant logic, and index definitions.

Every instance of this chart — in reports, on the website, in social media, in the interactive product — must conform to this standard.

---

## The Three Core Indices

### HEY — Housing Entry Barrier

**Full name:** Housing Entry Barrier  
**Unit:** Years  
**What it measures:** The number of years required for a median-income household to save a 20% down payment on a 2-bedroom benchmark property in a given city.  
**Formula:** `(Benchmark 2BR price × 0.20) ÷ (median occupation income after tax × savings rate)`  
**Role in the Matrix:** X-axis (horizontal). Lower = more accessible.  
**Interpretation:** A city with HEY = 4 means a median earner can realistically reach homeownership in approximately 4 years of disciplined saving. HEY = 13 means 13 years. The barrier is the concept; years is the unit.  
**Notes:** HEY is occupation-specific. The chart uses a city-level composite based on a weighted basket of representative occupations. Always state the unit when citing a value: "HEY = 13.0 years", never "HEY = 13.0".

---

### LAS — Lifestyle Appeal Score

**Full name:** Lifestyle Appeal Score  
**What it measures:** A composite score (0–100) reflecting the non-financial quality of a city as a place to live long-term.  
**Components (equal weight, 25% each):**
- Climate score (liveability, seasonal range)
- Cultural density (amenities, arts, dining, diversity)
- Infrastructure quality (transit, healthcare access, public services)
- Global recognition (international connectivity, institutional presence)

**Role in the Matrix:** Y-axis (vertical). Higher = more appealing.  
**Interpretation:** A score of 84 (Vancouver) reflects a city with strong performance across all four pillars. A score of 50 (Calgary) reflects a city with more modest performance on cultural density and global recognition, offset by strong infrastructure and climate resilience.  
**Notes:** LAS is a city-level metric, not occupation-specific. Future refinement may introduce sector-weighted variants.  
**Axis label:** Use "Lifestyle Appeal" in chart display. Reference full name "Lifestyle Appeal Score (LAS)" in methodology notes and footnotes.

---

### EOI — Employment Opportunity Index

**Full name:** Employment Opportunity Index  
**What it measures:** A relative index (0–100) of employment demand in a given city for a given occupation, combining job vacancy rates, wage growth trajectory, and sector size.  
**Role in the Matrix:** Bubble size. Larger bubble = stronger employment demand.  
**Legend format:** Three actual bubbles (small / medium / large) with "Employment demand" label. No text labels on the bubbles themselves.  
**Notes:** EOI is occupation-specific. The chart uses city-level composite EOI across a representative basket. Values are relative, not absolute — a city with EOI 92 has stronger employment demand than a city with EOI 65, within the same comparison set.

---

## Chart Anatomy

### Title
```
The Lakive City Matrix™
```
Always render the ™ symbol. Placement: top-left, 20px, weight 500.

### Subtitle
```
Mapping Canada's major cities by housing accessibility and lifestyle appeal.
```
13px, `var(--text-secondary)`.

### Dateline
```
Lakive Research · [Month Year]
```
11px, uppercase, letter-spacing 0.08em, `var(--text-muted)`.

### Axes

| Axis | Label line 1 | Label line 2 |
|------|-------------|-------------|
| X (horizontal) | `Housing Entry Barrier (HEY)` | `Years to save a 20% down payment` |
| Y (vertical) | `Lifestyle Appeal` | *(none)* |

X-axis: lower = better (more accessible). Direction implied by quadrant labels — no explicit arrow required.  
Y-axis: higher = better (more appealing). Direction indicated by subtle ↑ / ↓ in left margin.

### Median Reference Lines

Dashed lines at `x = median HEY` and `y = median LAS` across the city set.  
Labels placed directly on the lines:
- Vertical line: `Median HEY (X.X yrs)` — label at top-right of line
- Horizontal line: `Median Appeal (XX)` — label at right end of line

### City Labels

Format: `[City], [Province Code]`  
Examples: Vancouver, BC / Toronto, ON / Montréal, QC / Calgary, AB / Ottawa, ON  
Position: upper-left of bubble (right-aligned, offset from bubble edge). Consistent across all cities — never some left, some right.  
Background: semi-transparent pill in surface color to ensure readability over any quadrant.

### Bubble

- Fill: city color at 60% opacity
- Stroke: city color at 100% opacity, 1.5px
- Size: scaled by EOI (range: r=10 to r=22 pixels for EOI 65–92)

### Color System

**Canada cities:** blue-teal family (all differentiated but tonally cohesive)

| City | Hex |
|------|-----|
| Vancouver, BC | `#1A5DAF` |
| Toronto, ON | `#0B8FC5` |
| Montréal, QC | `#0C9688` |
| Ottawa, ON | `#4E7BBF` |
| Calgary, AB | `#15A876` |

**Future US cities:** amber-orange family (TBD on expansion)  
**Rationale:** Canada = blue-teal; US = amber-orange. A viewer should identify city nationality at a glance without reading the label.

---

## Quadrant System

The Matrix is divided into four quadrants by the median HEY (x-axis) and median LAS (y-axis) of the comparison set.

| Position | Name | One-line description |
|----------|------|----------------------|
| Upper-left (low HEY, high LAS) | **Global Gems** | High lifestyle appeal with relatively accessible housing. |
| Upper-right (high HEY, high LAS) | **Aspirational Cities** | Highly desirable cities with higher housing entry barriers. |
| Lower-left (low HEY, low LAS) | **Settlement Sweet Spot** | Lower housing barriers with practical long-term settlement potential. |
| Lower-right (high HEY, low LAS) | **High-Cost Trade-off** | Higher housing barriers without proportionally higher lifestyle appeal. |

**Quadrant label rendering:**
- Name: 11px, weight 500, muted color (~20% opacity), corner-anchored
- Description: 9px, weight 400, more muted (~11% opacity), below name
- Both are informational — they may not be readable at small sizes, and that is acceptable

---

## Footer

```
Bubble size = Employment Opportunity Index (EOI) · Dashed lines = median values
```
Left-aligned, 11px, `var(--text-muted)`.

```
© Lakive 2026 · lakive.com
```
Right-aligned, 11px, `var(--text-muted)`.

---

## Canonical Data (August 2026, Canada Composite)

| City | HEY | LAS | EOI |
|------|-----|-----|-----|
| Vancouver, BC | 13.0 | 84 | 80 |
| Toronto, ON | 9.6 | 72 | 92 |
| Montréal, QC | 5.5 | 65 | 72 |
| Ottawa, ON | 6.8 | 52 | 75 |
| Calgary, AB | 3.9 | 50 | 65 |

Median reference: HEY = 6.8 yrs, Lifestyle Appeal = 65

---

## Usage Rules

1. **Never modify the quadrant names** without updating this document first.
2. **Always show all three dimensions** (x, y, bubble size). Removing EOI degrades the framework to a 2D scatter.
3. **City labels are always Province-code format** — never "Vancouver" alone, always "Vancouver, BC".
4. **The ™ symbol is mandatory** in all formal contexts (reports, website, social). Omit only in code variable names.
5. **Median lines are mandatory.** They are what make the quadrant logic legible without a legend.
6. **Report review rule:** All instances of this chart in reports must be reviewed by the editor before web or PDF publication.

---

## Future Roadmap

- **LAS methodology page** on lakive.com — public documentation of how LAS is calculated
- **HEY occupation-specific tooltips** in the interactive version — hover a bubble to see HEY breakdown by occupation
- **US city expansion** — amber-orange color family, separate comparison sets or combined cross-border view
- **Formal index publication** — "The Lakive HEY / LAS / EOI Index: Methodology and 2026 Baseline" white paper
