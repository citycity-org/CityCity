# Lakive Social Media Internal Standard — v1.1 (July 2026)

> Archive copy for Claude/team reference. Authoritative file: `Lakive_Social_Media_Internal_Standard_v1.1.docx`.
> This standard governs all Lakive social content (Instagram, Threads, X, LinkedIn, Facebook, TikTok).

## 1. Brand Consistency
- One official logo lockup only: Lakive logo + tagline. No boxed/framed/alternative lockups.
- Tagline exactly: **"From Data to Belonging"** — title case, NO period. Assets/UI still carrying the period migrate at their next update.
- Typography: Inter Bold (headlines), Inter Regular (body), IBM Plex Mono (numbers).
- Palette = product codebase (single source of truth):
  - Background dark `#0F1623` · Teal accent `#14B8A6` · Blue accent `#4F8EF7` · Orange highlight `#F97316`
  - Palette changes go into the codebase first, then this doc. No off-palette hex in design tools.
  - Functional data-scale colors (score bands, annex to brand palette): 80+ `#14B8A6` · 70+ `#4F8EF7` · 60+ `#F59E0B` · 50+ `#F97316` · 40+ `#EF4444` · <40 `#DC2626`. Badge, bar, knob and label always use the band color of the score — no exceptions for rank #1.

## 2. Data Credibility
- Every number from Lakive site / report DB / approved dataset. All surfaces show the same figures; conflicts block publication.
- Methodology + reference date on the card when methodologies differ (e.g. "HPI-based, standard income model · Jun 2026").
- Every card carries a data reference date. Single Source of Truth.

## 3. Legal & Compliance
- No protected logos, trophies, team branding, kits, official event marks (FIFA, IOC, leagues). Newsjack with abstract elements only (colors, silhouettes, skylines, flags).
- No AI-generated likenesses of real public figures, including recognizable approximations.
- Famous quotes → text-based quote cards or abstract illustration; attribution line only, no portrait.
- Licensed photography only; keep license records per asset.

## 4. Content Principles
- One key insight per post. Headline ≤8 words; subheadline ≤15; body ≤40 where practical. 2–3 s mobile comprehension.

## 5. Content Types
- Insight: one statistic + one conclusion. City Spotlight: max 3 highlights. Scorecard: mobile-readable; fine print obeys §7 minimums.
- Reports: carousel pages (one table/finding per page), never a shrunken PDF in one image; long tables → LinkedIn docs or website.

## 6. Visual Style
- Authentic city photography, documentary aesthetic. Reduce artificial AI portraits; no AI crowds with recognizable faces.
- **All in-image text is typeset in the design tool. Never let an image model render words/logos/taglines** (root cause of the "Yeom data to belonging" incident).
- Hierarchy: Headline → Data → Image → CTA → Logo.

## 7. Readability & Accessibility (hard requirements)
- Contrast ≥ 4.5:1 (WCAG AA) for body/labels; ≥ 3:1 for large display numbers.
- Min rendered font size: 20 px on 1080-px-wide canvas. Nothing smaller ships.
- Dark backgrounds: no text below 55% white opacity; secondary labels 55–65%; body 80%+.
- Light logo variant on dark backgrounds — never the dark/teal logo on navy.
- QR: ≥120 px @1080, quiet zone kept, scan-tested from a phone screenshot; prefer caption links for feed posts.

## 8. CTA Standards
- Approved CTAs only: "Explore more at Lakive.com" / "Read the full report at Lakive.com".

## 9. Weekly Editorial Series (effective v1.1; update badges before next post; don't mix old/new names in one week)
Mon Future Starts Here · Tue Report Insight · Wed Career Insight · Thu City Spotlight · Fri City Compare · Sat Weekly Discovery · Sun Weekly Insight

## 10. AI Content Disclosure
- Photorealistic AI imagery labeled where platforms require/provide (Meta "AI Info", TikTok AI label). Illustrations exempt. Never pass AI scenes as documentary photos of real events.

## 11. Language Policy
- Default English. Québec-specific content gets a French version (or bilingual card), reviewed by a French speaker. Local spellings kept (Montréal, Québec City).

## 12. Correction & Takedown Protocol
- **A** legal/IP risk or fabricated data → immediate takedown, assess repost; owner: founder.
- **B** wrong number / broken visual (e.g. garbled logo) → correct + repost ≤24 h; delete if engagement low, else correction comment.
- **C** typo, no data impact → fix next slot. All corrections logged (date, post, issue, action).

## 13. Pre-Publish QA Checklist
Brand (lockup, tagline no period, fonts, palette) · Data (verified, methodology+date, no cross-surface conflict) · Content (spelling, AI-hallucination sweep of ALL in-image text) · Legal (©, ™, likeness, licenses) · Accessibility (§7) · Platform (crop, margins, QR test, AI label).

## 14. Core Principle
Every Post Must Be Worth Saving. Long-term decision value over short-term news.

---
Changes from v1.0: tagline standardized WITHOUT period (existing assets migrate at next update); palette aligned to codebase (replacing #151827/#20C5BE); added §7 accessibility hard limits, typeset-text rule (§6), AI disclosure (§10), language policy (§11), correction protocol (§12); QA expanded; series rename effective-date note.
