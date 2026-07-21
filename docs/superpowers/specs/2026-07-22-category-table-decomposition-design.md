# Design Spec: Category Table Decomposition & Executive Summary Rework

**Date:** 2026-07-22
**Client:** Stories (café/F&B brand), engagement led by Ru'ya 360 / KiTS
**Author:** Kits (assistant) + user, via brainstorming session
**Status:** Draft — pending user review of this document

## 1. Purpose

This is the first of three planned changes to the Stories Pricing Benchmark dashboard (the other two — a "hide/show explanations" redesign and a Stories-branded color palette — are separate follow-up specs, sequenced after this one).

The dashboard currently renders a single `PricingReport` with one universal competitor set (Espresso Lab, Dunkin Donuts, Joe & the Juice, Starbucks) applied across all 25 menu categories. Going forward, the client is sending category-specific pricing comparisons where the competitor set differs per category (e.g. Frozen Yogurt is benchmarked against Pinkberry, Fro-U, and Cremino — not the coffee chains). This spec covers restructuring the pipeline and dashboard to support multiple, independently-scoped category-group reports on one page, plus a rework of the Executive Summary that management found too abstract.

## 2. Source Data — This Drop

Three files involved, referenced from `raw-data/`:

- **`Frozen Yogurt Pricing Comparison (1).xlsx`** — two categories in one sheet: **Frozen Yogurt** (rows 2–66) and **Toppings** (rows 67–142). Competitors: Pinkberry, Cremino, Fro-U. The "Cremino" column has a header but zero priced cells — per user instruction, kept as a listed competitor with blank/pending cells, not dropped, until real numbers are provided. A block of unrelated cells at columns I–O (cup-size-in-ounces reference notes) is not part of the priced dataset and is excluded from parsing.
- **`Non Dairy Product Pricing Comparison (1) (1).xlsx`** — five categories: Mixed Hot Beverages, Blended Drinks, Mixed Cold Beverages, Signature, Protein Shakes. Competitors: Espresso Lab, Dunkin Donuts, Joe & the Juice, Starbucks (same as the master file), though the sheet's header row uses abbreviations — "Esp. Lab", "D. Donuts", "J & J" — for three of them. **Correction from an earlier draft of this spec:** these categories were initially assumed to *refresh* the master file's numbers for the same category names, since the labels overlap. The user has since clarified that items here (e.g. "Cappuccino") are a **distinct non-dairy-alternative product line** from the master file's regular versions, not updated prices for the same SKUs — confirmed by checking the master's original Cappuccino Medium price (400,000 LBP) against the official POS price list (also 400,000 LBP; they already agreed) versus this file's Cappuccino Medium (600,000 LBP, a different item). None of these five categories touch the main table; all five become their own **Non-Dairy Menu** category-group report.
- **`officially provided Menu Stories prices.xlsx`** — Stories' own POS export (item name + selling price, no competitors, no categories). Confirmed by the user as the **authoritative source of truth** for Stories' own prices, to be checked against every comparison sheet. A full reconciliation was run (`docs/price-reconciliation-2026-07-22.md`) — see §2.1.

Both comparison files (Frozen Yogurt, Non-Dairy) are tagged `report_date: 2026-07-22` (today, per explicit user instruction — there was a mix-up on the client's end about dating this data, and they confirmed it should be dated as of today rather than backdated to the March period). Both reuse the master report's existing FX rate (89,600 LBP/USD as of 2026-07-20, lira-rate.com/lbprate.com) rather than re-sourcing a new rate two days later — flagged as an assumption, reversible if the user wants a fresh rate for future drops.

### 2.1 Price reconciliation against the official source of truth

Comparing every comparison sheet's "Stories" column against the official POS price list, by exact normalized product name, found **33 scattered one-off mismatches** — isolated items, no pattern, read as ordinary price updates the comparison sheets hadn't caught yet, concentrated in categories that are leaving the main table anyway (Gluten Free, Luxury Toppings, Toppings, Plat Du Jour, Salads) plus a couple of isolated items in categories staying put (Pastries, one Mixed Cold Beverages item). Full list in `docs/price-reconciliation-2026-07-22.md`.

An earlier pass of that same check also flagged what looked like a systematic ~30–50% mismatch across every matched item in the Non-Dairy file's Mixed Hot/Cold Beverages and Signature categories — that turned out to be a false positive from name-matching two genuinely different products (regular vs. non-dairy-alternative versions) that happen to share a name, not a real pricing discrepancy. Corrected in the reconciliation doc.

**Per user instruction, none of the 33 confirmed mismatches have been applied yet** — held pending a management answer, kept ready to apply quickly once confirmed. This spec's pipeline work proceeds using the comparison sheets' numbers as they currently stand; the correction is a follow-up data fix, not blocked on this spec, and not part of its scope.

## 3. Category Disposition

**Leaving the main table (11 categories)** — the user's original drop list (Milkshakes, Protein Shakes, Salads, Sandwiches, Frozen Yogurt, Toppings, Luxury Toppings, Pizza, Wraps, Gluten Free) plus Plat Du Jour, added during this session since its own comparison sheet is also in progress. Note Protein Shakes stays *dropped* even though the Non-Dairy file's "Protein Shakes" turned out to be a distinct product line rather than a refresh (§2) — the user confirmed master's original Protein Shakes data should still be pulled out as a placeholder, awaiting a dedicated comparison sheet, rather than restored to the main table:

| Category | Destination |
|---|---|
| Frozen Yogurt | **Frozen Yogurt Bar** report (has data now) |
| Toppings | **Frozen Yogurt Bar** report (has data now) |
| Milkshakes | Placeholder — awaiting data |
| Protein Shakes | Placeholder — awaiting data (master's existing data intentionally not restored — see above) |
| Salads | Placeholder — awaiting data (sheet in progress) |
| Sandwiches | Placeholder — awaiting data |
| Pizza | Placeholder — awaiting data |
| Wraps | Placeholder — awaiting data |
| Gluten Free | Placeholder — awaiting data |
| Luxury Toppings | Placeholder — awaiting data (kept split from "Toppings" per user instruction — the new file only fills regular Toppings) |
| Plat Du Jour | Placeholder — awaiting data (sheet in progress) |

**Never in the main table, own report:** Mixed Hot Beverages, Blended Drinks, Mixed Cold Beverages, Signature (the Non-Dairy file's non-dairy-alternative versions) — these share category *names* with main-table categories but are a distinct product line (§2), so they form their own **Non-Dairy Menu** report rather than touching the main table at all. The main table's own Mixed Hot Beverages / Blended Drinks / Mixed Cold Beverages / Signature categories (regular, dairy versions) are untouched.

**Staying in the main table, untouched:** Add-Ons, Black Coffee, Brewed Coffee, Croissants, Mixed Hot Beverages, Blended Drinks, Mixed Cold Beverages, Signature, Pastries, Retail Coffee Beans, Shots, Shakes, Soft Drinks & Juices, TEA.

No grouping is assumed between the 9 placeholder categories — each may get its own distinct competitor roster once its sheet arrives, so each is a standalone placeholder, not pre-bundled with the others.

## 4. Pipeline Architecture

The existing pipeline (`parse_workbook` → `analyze_pricing`) already supports one Excel + one config producing one report with its own `own_brand`/`competitors` pair, and already validates that a file's brand columns exactly match its config's expected brands. Since none of the three reports need records merged or split across files (§3 — each output report maps 1:1 to one input file's full category set), no cross-file composition step is needed. That per-file isolation is preserved and extended with two small, generic, config-driven additions to `parse_workbook`:

1. **`dropped_categories`** (optional config key, list of category names): rows under those category headers are skipped entirely when building records. Used by the master source config for the 11 categories in §3.
2. **`brand_aliases`** (optional config key, `{sheet header text: canonical brand name}`): translates a sheet's literal header text to the canonical brand name before validating against `competitors`/`own_brand` and before writing records. Used by the Non-Dairy source config, whose header row abbreviates three competitor names ("Esp. Lab" → "Espresso Lab", "D. Donuts" → "Dunkin Donuts", "J & J" → "Joe & the Juice").

Three independent `parse_workbook` → `analyze_pricing` runs, one per source file, each producing one complete output report:
- **Main report** = master file, `dropped_categories` = the 11 categories in §3. `own_brand`/`competitors` unchanged (Espresso Lab, Dunkin Donuts, Joe & the Juice, Starbucks).
- **Frozen Yogurt Bar report** = Frozen Yogurt file in full (Frozen Yogurt + Toppings categories). Competitors: Pinkberry, Cremino, Fro - U.
- **Non-Dairy Menu report** = Non-Dairy file in full (Mixed Hot Beverages, Blended Drinks, Mixed Cold Beverages, Signature, Protein Shakes), `brand_aliases` applied. Competitors: Espresso Lab, Dunkin Donuts, Joe & the Juice, Starbucks.

No changes needed to `analyze_pricing` — it already operates per-report (price index, comparability, tiers, outliers, category rollups).

Exact file/function layout is decided at implementation-planning time; this section fixes the data flow, not the code structure.

## 5. Page Composition

`page.tsx` currently hardcodes one report through 5 stacked sections (heatmap, Category Positioning, Price Positioning Map, Findings & Recommendations, Full Data Explorer). All the underlying analytics functions and components are already parameterized by report data, not hardcoded globals, so this becomes a low-risk extraction:

- A new reusable `<ReportSection>` block wraps those same 5 views, parameterized by report + section title.
- Page order: Cover → Context Bar → Executive Summary (v2, see §6) → Methodology (main report) → **Main Menu** ReportSection → **Frozen Yogurt Bar** ReportSection → **Non-Dairy Menu** ReportSection → **Categories In Progress** (grouped placeholder section, 9 cards) → footer.
- Each category-group section gets the full 5-view treatment (heatmap-style grid, positioning chart, price map, findings, data explorer) scoped to its own categories and competitor set — no shared/blended views across groups, since competitor baselines aren't comparable across groups.
- No new page navigation (sticky nav / tabs) for now — single scrolling page, revisited once more groups land and length becomes a real problem.

### 5.1 "Awaiting data" placeholder cards

Each of the 9 pending categories (§3) gets a compact card (category name, a plain "data not yet available" state, no numbers, no chart) grouped together in one "Categories In Progress" section near the bottom of the page — kept out of the way of the data-backed sections so the dashboard doesn't read as broken or unfinished at a glance.

## 6. Executive Summary v2

Management feedback (relayed by the user): the current KPI-tile Executive Summary (blended price index, coverage %, top 3 over/under-indexed categories) reads as too abstract/technical, has no dollar framing, and doesn't break down by category group.

**Constraint:** the dataset has prices only, no sales volume/unit data. A true dollar *revenue* or *margin* impact figure cannot be honestly computed and will not be invented. What *is* honestly computable is the average LBP/USD **price gap** vs. market — a real number, just not a revenue-impact number. This distinction is preserved in the UI copy (e.g. "average gap vs. market," never "revenue at risk" or similar).

Redesign:
- **One scorecard per report** (Main Menu, Frozen Yogurt Bar, Non-Dairy Menu, and future groups as they land): category-group name, item count, average LBP (+ USD) price gap vs. market, and a plain over/under-priced item count. Replaces the single blended KPI tile grid.
- **A short plain-language headline banner** above the scorecards, generated from the data (e.g. "Priced above market in Coffee & Café, below market in Frozen Yogurt") so the takeaway reads in one sentence before any numbers.
- Index numbers (e.g. "104") are no longer the headline metric here — they remain the underlying calculation and are still shown in Methodology, Findings & Recommendations, and the Data Explorer, where the audience is closer to the raw analysis.

## 7. Non-Goals (this spec)

- The "hide/show explanations" redesign (renaming/redefining the Presenter Mode toggle, hiding section-intro paragraphs by default) — separate spec, next in sequence.
- The Stories brand color/logo rebrand — separate spec, after that.
- Any category beyond the 11 named in §3 — categories not on the drop list (e.g. Black Coffee, Brewed Coffee) are untouched by this change.
- Sales volume/revenue-impact analytics — not possible with current data; flagged, not built.

## 8. Open Assumptions to Confirm

- Reusing the master report's FX rate/date/source for the two new reports rather than sourcing a fresh rate (§2) — reversible if the user objects.
- Exact wording/thresholds for the Executive Summary's auto-generated headline banner — decided at implementation time, kept in plain, non-alarmist language.
