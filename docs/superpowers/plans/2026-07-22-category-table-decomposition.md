# Category Table Decomposition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single universal-competitor dashboard into three independent category-group reports (Main Menu, Frozen Yogurt Bar, Non-Dairy Menu) each with its own competitor roster, add "awaiting data" placeholders for categories with no data yet, and replace the abstract Executive Summary with per-group scorecards in plain LBP/USD gap language.

**Architecture:** Two small, generic, config-driven additions to the existing Python `parse_workbook` (`dropped_categories`, `brand_aliases`) plus two new source configs let three independent `parse → analyze` pipeline runs produce three complete, self-contained report JSONs — no cross-file merging needed. On the frontend, the existing per-report analytics functions and view components (already parameterized by report data) are wrapped in a new reusable `<ReportSection>` block and instantiated once per report; a new `<ExecutiveSummary>` v2 and `<CategoriesInProgress>` placeholder grid round out the page.

**Tech Stack:** Python 3.12 + openpyxl + pytest (pipeline); Next.js 16 / React 19 / TypeScript + Vitest + Testing Library (dashboard).

**Reference spec:** `docs/superpowers/specs/2026-07-22-category-table-decomposition-design.md`. Reconciliation context: `docs/price-reconciliation-2026-07-22.md` (33 confirmed one-off price mismatches held pending a management answer — out of scope for this plan, does not block it).

## Global Constraints

- Pipeline code stays generic/config-driven — no client-specific category or brand names hardcoded in `scripts/pricing_pipeline/*.py`; they live in `sources/*.json`.
- `dropped_categories` and `brand_aliases` are both **optional** config keys — omitting either must not change existing behavior (backward compatible with the current master config and all existing tests).
- Currency: LBP is the primary figure everywhere; USD is a derived secondary display only. No changes to this convention.
- The three new/updated reports (`stories-pricing-2026-03`, `stories-frozen-yogurt-2026-07`, `stories-non-dairy-2026-07`) are fully independent — no shared record set, no merge step. Each is produced by exactly one `parse_workbook` → `analyze_pricing` run against exactly one source file.
- Report_date for the two new sources is `2026-07-22`; both reuse the master's existing FX rate (`89600`, `fx_rate_date: 2026-07-20`, `lira-rate.com / lbprate.com market average (parallel/market rate)`).
- Frontend: every new/changed component keeps the existing Ocean color tokens (`text-ocean`, `text-ocean-muted`, `font-display`) and Tailwind conventions already used throughout `web/components/`. No color/branding changes in this plan (that's a separate, later spec).
- No revenue/margin figures anywhere — only price-gap (own price minus competitor average) is ever shown as a dollar figure, per the spec's data-honesty constraint.

---

### Task 1: `parse_workbook` — `dropped_categories`, `brand_aliases`, and the "Avg" header variant

**Files:**
- Modify: `scripts/pricing_pipeline/parse_pricing.py`
- Test: `scripts/tests/test_parse_workbook.py`

**Interfaces:**
- Consumes: nothing new — existing `parse_workbook(xlsx_path: str, config: dict) -> dict`.
- Produces: `parse_workbook` now reads two additional **optional** config keys: `config["dropped_categories"]` (`list[str]`, default `[]`) and `config["brand_aliases"]` (`dict[str, str]`, default `{}`, maps a sheet's literal header text to the canonical brand name used in `own_brand`/`competitors`). Return shape (`{"meta": ..., "records": [...]}`) is unchanged.
- **Also fixes a real-data blocker**: the average-column locator currently matches only the literal header text `"Average"`. The actual `Non Dairy Product Pricing Comparison (1) (1).xlsx` file (verified directly with openpyxl) labels that column `"Avg"` instead — confirmed by reading its header row: `['Products Competitors', 'Stories ', 'Esp. Lab', 'D. Donuts', 'J & J', 'Starbucks ', 'Avg', 'Dif.', None]`. Without this fix, Task 3's pipeline run against the real Non-Dairy file raises `ValueError: Could not locate the 'Average' column`. This is a structural header-label synonym (not client/brand-specific data), so it's handled as a small built-in synonym rather than a new config key.

- [ ] **Step 1: Write the failing tests**

Add to `scripts/tests/test_parse_workbook.py` (after the existing tests, using the existing `_config()` helper already in that file):

```python
def test_parse_workbook_skips_dropped_categories(tmp_path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Products Competitors", "Stories ", "Espresso Lab", "Dunkin Donuts",
               "Joe & the Juice", "Starbucks ", "Average", "Difference"])
    ws.append(["Black Coffee", None, None, None, None, None, None, None])
    ws.append(["Double Espresso Macchiato", 300000, "-", "-", "-", "-", 300000, 0])
    ws.append(["Salads", None, None, None, None, None, None, None])
    ws.append(["Quinoa Salad", 770000, "-", "-", "-", "-", 770000, 0])
    path = tmp_path / "sample_dropped.xlsx"
    wb.save(path)

    config = _config()
    config["dropped_categories"] = ["Salads"]

    result = parse_workbook(str(path), config)

    categories = {r["category"] for r in result["records"]}
    assert categories == {"Black Coffee"}
    assert all(r["product"] != "Quinoa Salad" for r in result["records"])


def test_parse_workbook_without_dropped_categories_key_is_unaffected(tmp_path):
    xlsx_path = _build_workbook(tmp_path)
    result = parse_workbook(xlsx_path, _config())
    assert len(result["records"]) == 4


def test_parse_workbook_accepts_avg_as_average_header(tmp_path):
    """Some sheets label the average column 'Avg' instead of 'Average'
    (e.g. the real Non-Dairy Product Pricing Comparison file) — the
    average-column locator must accept both."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Products Competitors", "Stories ", "Espresso Lab", "Dunkin Donuts",
               "Joe & the Juice", "Starbucks ", "Avg", "Dif."])
    ws.append(["Black Coffee", None, None, None, None, None, None, None])
    ws.append(["Double Espresso Macchiato", 300000, "-", "-", "-", "-", 300000, 0])
    path = tmp_path / "sample_avg_header.xlsx"
    wb.save(path)

    result = parse_workbook(str(path), _config())

    assert len(result["records"]) == 1
    assert result["records"][0]["price_lbp"] == 300000


def test_parse_workbook_applies_brand_aliases(tmp_path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Products Competitors", "Stories ", "Esp. Lab", "D. Donuts",
               "J & J", "Starbucks ", "Avg", "Dif."])
    ws.append(["Mixed Hot Beverages", None, None, None, None, None, None, None])
    ws.append(["Cappuccino MEDIUM", 600000, 650000, 576000, 554900, 550000, 586180, 13820])
    path = tmp_path / "sample_aliased.xlsx"
    wb.save(path)

    config = _config()
    config["brand_aliases"] = {
        "Esp. Lab": "Espresso Lab",
        "D. Donuts": "Dunkin Donuts",
        "J & J": "Joe & the Juice",
    }

    result = parse_workbook(str(path), config)

    brands = {r["brand"] for r in result["records"]}
    assert brands == {"Stories", "Espresso Lab", "Dunkin Donuts", "Joe & the Juice", "Starbucks"}
    cappuccino_stories = [r for r in result["records"] if r["product"] == "Cappuccino MEDIUM" and r["brand"] == "Stories"]
    assert cappuccino_stories[0]["price_lbp"] == 600000
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/casio699/kenaan/data && PYTHONPATH=scripts .venv/bin/pytest scripts/tests/test_parse_workbook.py -v`
Expected: `test_parse_workbook_skips_dropped_categories`, `test_parse_workbook_accepts_avg_as_average_header`, and `test_parse_workbook_applies_brand_aliases` FAIL (dropped categories still present / `ValueError: Could not locate the 'Average' column` / `ValueError` about mismatched header brands); `test_parse_workbook_without_dropped_categories_key_is_unaffected` PASSES already (baseline, confirms no regression before the change).

- [ ] **Step 3: Implement `dropped_categories`, `brand_aliases`, and the "Avg" header variant in `parse_workbook`**

In `scripts/pricing_pipeline/parse_pricing.py`, replace the body of `parse_workbook` from the brand-column extraction through the row loop with:

```python
def parse_workbook(xlsx_path: str, config: dict) -> dict:
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(min_row=1, max_row=ws.max_row, values_only=True))

    header = rows[0]

    # Locate the average column to determine the actual brand column span.
    # Most sheets label it "Average"; the Non-Dairy comparison file labels
    # it "Avg" instead — accept both rather than adding a config key for
    # what is a structural header-label variant, not client-specific data.
    average_col_index = None
    for i, col_header in enumerate(header):
        if _clean(col_header) in ("Average", "Avg"):
            average_col_index = i
            break

    if average_col_index is None:
        raise ValueError(
            "Could not locate the 'Average' column in the header row — "
            "sheet layout does not match the expected template."
        )

    # Extract the FULL actual set of brand columns from the file, then
    # translate any header text an alias covers (e.g. "Esp. Lab" -> "Espresso
    # Lab") to the canonical brand name before validating against config.
    brand_aliases = {_clean(k): _clean(v) for k, v in config.get("brand_aliases", {}).items()}
    raw_brand_columns = [_clean(h) for h in header[1:average_col_index]]
    brand_columns = [brand_aliases.get(b, b) for b in raw_brand_columns]

    # Validate that header brands match config brands (bidirectional check)
    expected_brands = {_clean(config["own_brand"]), *[_clean(c) for c in config["competitors"]]}
    actual_brands = set(brand_columns)

    if actual_brands != expected_brands:
        missing = expected_brands - actual_brands
        extra = actual_brands - expected_brands
        raise ValueError(
            f"Header brand columns {brand_columns} do not match config's expected brands "
            f"(own_brand + competitors). Missing from header: {sorted(missing) or 'none'}. "
            f"Present in header but not in config: {sorted(extra) or 'none'}."
        )

    dropped_categories = {_clean(c) for c in config.get("dropped_categories", [])}

    fx_rate = config["fx_usd_rate"]
    records = []
    current_category = None

    for row in rows[1:]:
        product = _clean(row[0])
        if product is None:
            continue

        if is_category_header_row(row):
            current_category = product
            continue

        if current_category in dropped_categories:
            continue

        for i, brand in enumerate(brand_columns):
            price = row[1 + i]
            if not isinstance(price, (int, float)):
                continue
            records.append({
                "category": current_category,
                "product": product,
                "brand": brand,
                "price_lbp": price,
                "price_usd": round(price / fx_rate, 2),
            })

    meta = {
        "client": config["client"],
        "report_date": config["report_date"],
        "currency": config["currency"],
        "fx_usd_rate": fx_rate,
        "fx_rate_date": config["fx_rate_date"],
        "fx_source": config["fx_source"],
        "own_brand": _clean(config["own_brand"]),
        "competitors": [_clean(c) for c in config["competitors"]],
        "generated_from": xlsx_path,
    }

    return {"meta": meta, "records": records}
```

(Only the brand-column extraction, the new `dropped_categories` set, and the one new `if current_category in dropped_categories: continue` line are new — the rest is unchanged from the current implementation.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/casio699/kenaan/data && PYTHONPATH=scripts .venv/bin/pytest scripts/tests/test_parse_workbook.py scripts/tests/test_run_pipeline.py scripts/tests/test_category_header.py -v`
Expected: all PASS, including every pre-existing test in the file (no regressions).

- [ ] **Step 5: Commit**

```bash
git add scripts/pricing_pipeline/parse_pricing.py scripts/tests/test_parse_workbook.py
git commit -m "feat: support dropped_categories and brand_aliases in parse_workbook"
```

---

### Task 2: New and updated source configs

**Files:**
- Modify: `sources/stories-pricing-2026-03.json`
- Create: `sources/stories-frozen-yogurt-2026-07.json`
- Create: `sources/stories-non-dairy-2026-07.json`

**Interfaces:**
- Consumes: `dropped_categories` / `brand_aliases` keys from Task 1.
- Produces: three config files, each loadable by `load_source_config` (`scripts/pricing_pipeline/config.py` — unchanged, extra keys pass through since it only checks `REQUIRED_KEYS` is a subset).

This task has no unit test of its own — it's data, verified by Task 3's integration test running the real pipeline against these exact configs and the real committed `raw-data/*.xlsx` files.

- [ ] **Step 1: Update the master config with `dropped_categories`**

Replace the full contents of `sources/stories-pricing-2026-03.json`:

```json
{
  "client": "Stories",
  "report_date": "2026-03-01",
  "currency": "LBP",
  "fx_usd_rate": 89600,
  "fx_rate_date": "2026-07-20",
  "fx_source": "lira-rate.com / lbprate.com market average (parallel/market rate)",
  "own_brand": "Stories",
  "competitors": ["Espresso Lab", "Dunkin Donuts", "Joe & the Juice", "Starbucks"],
  "dropped_categories": [
    "Milkshakes",
    "Protein Shakes",
    "Salads",
    "Sandwiches",
    "Frozen Yogurt",
    "Toppings",
    "Luxury Toppings",
    "Pizza",
    "Wraps",
    "Gluten Free",
    "Plat Du Jour"
  ]
}
```

- [ ] **Step 2: Create the Frozen Yogurt Bar config**

Create `sources/stories-frozen-yogurt-2026-07.json`:

```json
{
  "client": "Stories",
  "report_date": "2026-07-22",
  "currency": "LBP",
  "fx_usd_rate": 89600,
  "fx_rate_date": "2026-07-20",
  "fx_source": "lira-rate.com / lbprate.com market average (parallel/market rate)",
  "own_brand": "Stories",
  "competitors": ["Pinkberry", "Cremino", "Fro - U"]
}
```

- [ ] **Step 3: Create the Non-Dairy Menu config**

Create `sources/stories-non-dairy-2026-07.json`:

```json
{
  "client": "Stories",
  "report_date": "2026-07-22",
  "currency": "LBP",
  "fx_usd_rate": 89600,
  "fx_rate_date": "2026-07-20",
  "fx_source": "lira-rate.com / lbprate.com market average (parallel/market rate)",
  "own_brand": "Stories",
  "competitors": ["Espresso Lab", "Dunkin Donuts", "Joe & the Juice", "Starbucks"],
  "brand_aliases": {
    "Esp. Lab": "Espresso Lab",
    "D. Donuts": "Dunkin Donuts",
    "J & J": "Joe & the Juice"
  }
}
```

- [ ] **Step 4: Verify all three configs load without error**

Run:
```bash
cd /home/casio699/kenaan/data
PYTHONPATH=scripts .venv/bin/python -c "
from pricing_pipeline.config import load_source_config
for p in ['sources/stories-pricing-2026-03.json', 'sources/stories-frozen-yogurt-2026-07.json', 'sources/stories-non-dairy-2026-07.json']:
    print(p, '->', load_source_config(p)['own_brand'])
"
```
Expected: all three print `Stories` with no `ValueError`.

- [ ] **Step 5: Commit**

```bash
git add sources/stories-pricing-2026-03.json sources/stories-frozen-yogurt-2026-07.json sources/stories-non-dairy-2026-07.json
git commit -m "feat: add source configs for Frozen Yogurt Bar and Non-Dairy Menu reports"
```

---

### Task 3: Build script wiring all three reports, plus an integration test

**Files:**
- Create: `scripts/build_reports.sh`
- Modify: `.github/workflows/deploy.yml`
- Test: `scripts/tests/test_build_reports_integration.py`

**Interfaces:**
- Consumes: the three configs from Task 2, the three committed raw Excel files in `raw-data/`, the existing `pricing_pipeline.parse_pricing` and `pricing_pipeline.analyze_pricing` CLIs (unchanged).
- Produces: `processed/stories-pricing-2026-03.json`, `processed/stories-frozen-yogurt-2026-07.json`, `processed/stories-non-dairy-2026-07.json` — each a complete `PricingReport`-shaped JSON (see `web/lib/data/types.ts`), each independently loadable by `loadReport(slug)`.

- [ ] **Step 1: Write the failing integration test**

Create `scripts/tests/test_build_reports_integration.py`:

```python
import json
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

DROPPED_FROM_MAIN = {
    "Milkshakes", "Protein Shakes", "Salads", "Sandwiches", "Frozen Yogurt",
    "Toppings", "Luxury Toppings", "Pizza", "Wraps", "Gluten Free", "Plat Du Jour",
}


def test_build_reports_produces_three_independent_reports():
    subprocess.run(["bash", "scripts/build_reports.sh"], cwd=REPO_ROOT, check=True)

    main = json.loads((REPO_ROOT / "processed" / "stories-pricing-2026-03.json").read_text())
    fyb = json.loads((REPO_ROOT / "processed" / "stories-frozen-yogurt-2026-07.json").read_text())
    non_dairy = json.loads((REPO_ROOT / "processed" / "stories-non-dairy-2026-07.json").read_text())

    main_categories = {p["category"] for p in main["products"]}
    assert main_categories.isdisjoint(DROPPED_FROM_MAIN)
    assert main["meta"]["competitors"] == ["Espresso Lab", "Dunkin Donuts", "Joe & the Juice", "Starbucks"]

    assert {p["category"] for p in fyb["products"]} == {"Frozen Yogurt", "Toppings"}
    assert fyb["meta"]["competitors"] == ["Pinkberry", "Cremino", "Fro - U"]

    non_dairy_categories = {p["category"] for p in non_dairy["products"]}
    assert non_dairy_categories == {
        "Mixed Hot Beverages", "Blended Drinks", "Mixed Cold Beverages", "Signature", "Protein Shakes",
    }
    assert non_dairy["meta"]["competitors"] == ["Espresso Lab", "Dunkin Donuts", "Joe & the Juice", "Starbucks"]

    # Non-Dairy Menu's Cappuccino is a distinct non-dairy-alternative product
    # from the main table's regular Cappuccino, not a price update to it —
    # confirms the two reports really are independent, not merged.
    non_dairy_cappuccino = [
        p for p in non_dairy["products"]
        if p["product"] == "Cappuccino MEDIUM" and p["category"] == "Mixed Hot Beverages"
    ]
    assert non_dairy_cappuccino
    assert non_dairy_cappuccino[0]["own_price_lbp"] == 600000

    main_cappuccino = [
        p for p in main["products"]
        if p["product"] == "Cappuccino MEDIUM" and p["category"] == "Mixed Hot Beverages"
    ]
    assert main_cappuccino
    assert main_cappuccino[0]["own_price_lbp"] == 400000
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /home/casio699/kenaan/data && PYTHONPATH=scripts .venv/bin/pytest scripts/tests/test_build_reports_integration.py -v`
Expected: FAIL — `scripts/build_reports.sh: No such file or directory`.

- [ ] **Step 3: Write `scripts/build_reports.sh`**

Create `scripts/build_reports.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH=scripts

# Main Menu — master file, minus the categories in dropped_categories.
python -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/Product Pricing Comparison March 2026 (1).xlsx" \
  --config sources/stories-pricing-2026-03.json \
  --out processed/stories-pricing-2026-03.normalized.json
python -m pricing_pipeline.analyze_pricing \
  --in processed/stories-pricing-2026-03.normalized.json \
  --out processed/stories-pricing-2026-03.json

# Frozen Yogurt Bar — Frozen Yogurt + Toppings, competitors Pinkberry/Cremino/Fro - U.
python -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/Frozen Yogurt Pricing Comparison (1).xlsx" \
  --config sources/stories-frozen-yogurt-2026-07.json \
  --out processed/stories-frozen-yogurt-2026-07.normalized.json
python -m pricing_pipeline.analyze_pricing \
  --in processed/stories-frozen-yogurt-2026-07.normalized.json \
  --out processed/stories-frozen-yogurt-2026-07.json

# Non-Dairy Menu — Mixed Hot/Cold Beverages, Blended Drinks, Signature, Protein
# Shakes (non-dairy-alternative versions), standard 4 competitors.
python -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/Non Dairy Product Pricing Comparison (1) (1).xlsx" \
  --config sources/stories-non-dairy-2026-07.json \
  --out processed/stories-non-dairy-2026-07.normalized.json
python -m pricing_pipeline.analyze_pricing \
  --in processed/stories-non-dairy-2026-07.normalized.json \
  --out processed/stories-non-dairy-2026-07.json
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /home/casio699/kenaan/data && PYTHONPATH=scripts .venv/bin/pytest scripts/tests/test_build_reports_integration.py -v`
Expected: PASS. This also leaves real `processed/*.json` files on disk from the real committed raw data — needed by Task 9's manual verification.

- [ ] **Step 5: Wire the script into CI**

In `.github/workflows/deploy.yml`, replace the `Regenerate processed data` step:

```yaml
      - name: Regenerate processed data
        env:
          PYTHONPATH: scripts
        run: |
          python -m pricing_pipeline.parse_pricing \
            --xlsx "raw-data/Product Pricing Comparison March 2026 (1).xlsx" \
            --config sources/stories-pricing-2026-03.json \
            --out processed/stories-pricing-2026-03.normalized.json
          python -m pricing_pipeline.analyze_pricing \
            --in processed/stories-pricing-2026-03.normalized.json \
            --out processed/stories-pricing-2026-03.json
```

with:

```yaml
      - name: Regenerate processed data
        run: bash scripts/build_reports.sh
```

- [ ] **Step 6: Commit**

```bash
git add scripts/build_reports.sh scripts/tests/test_build_reports_integration.py .github/workflows/deploy.yml
git commit -m "feat: build all three category-group reports from one script"
```

---

### Task 4: Extract a shared `<Section>` component

**Files:**
- Create: `web/components/Section.tsx`
- Test: `web/components/Section.test.tsx`
- Modify: `web/app/page.tsx` (remove the local `Section` function; import the new one — full rewire happens in Task 9, but remove the duplicate now to avoid two definitions coexisting)

**Interfaces:**
- Produces: `Section({ title, children, first, last, level }: { title: string; children: React.ReactNode; first?: boolean; last?: boolean; level?: 2 | 3 }) => JSX.Element`. `level` defaults to `2` (matches today's page-level sections); `level={3}` is for sections nested inside a `<ReportSection>` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `web/components/Section.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Section } from "./Section";

describe("Section", () => {
  it("renders an h2 heading by default", () => {
    render(
      <Section title="Executive Summary">
        <p>content</p>
      </Section>
    );
    expect(screen.getByRole("heading", { level: 2, name: "Executive Summary" })).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders an h3 heading when level is 3", () => {
    render(
      <Section title="Findings" level={3}>
        <p>content</p>
      </Section>
    );
    expect(screen.getByRole("heading", { level: 3, name: "Findings" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd web && npm run test -- Section.test.tsx`
Expected: FAIL — `Section.tsx` does not exist.

- [ ] **Step 3: Create `Section.tsx`**

Create `web/components/Section.tsx`:

```tsx
import type { ReactNode } from "react";

export function Section({
  title,
  children,
  first,
  last,
  level = 2,
}: {
  title: string;
  children: ReactNode;
  first?: boolean;
  last?: boolean;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  const headingClassName = level === 2 ? "mb-5 font-display text-xl text-ocean" : "mb-4 font-display text-lg text-ocean";

  return (
    <section className={`${first ? "pt-10" : "pt-12"} ${last ? "pb-14" : "border-b border-ocean/10 pb-12"}`}>
      <Heading className={headingClassName}>{title}</Heading>
      {children}
    </section>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd web && npm run test -- Section.test.tsx`
Expected: PASS.

- [ ] **Step 5: Remove the duplicate local `Section` from `page.tsx` and import the new one**

In `web/app/page.tsx`, add to the import list:

```tsx
import { Section } from "@/components/Section";
```

and delete the local `function Section({ title, children, first, last }: {...}) { ... }` definition at the bottom of the file (page.tsx still works unmodified otherwise — it already calls `<Section title=... first>` / `<Section title=...>` the same way).

- [ ] **Step 6: Run the full frontend test suite**

Run: `cd web && npm run test`
Expected: all PASS, no regressions.

- [ ] **Step 7: Commit**

```bash
git add web/components/Section.tsx web/components/Section.test.tsx web/app/page.tsx
git commit -m "refactor: extract shared Section component"
```

---

### Task 5: `computeReportScorecard` and `buildHeadline` analytics

**Files:**
- Create: `web/lib/analytics/scorecard.ts`
- Test: `web/lib/analytics/scorecard.test.ts`

**Interfaces:**
- Consumes: `PricingReport`, `ProductAnalytics` from `web/lib/data/types.ts` (unchanged).
- Produces:
  - `interface ReportScorecard { reportLabel: string; itemCount: number; avgGapLbp: number | null; overpricedCount: number; underpricedCount: number }`
  - `computeReportScorecard(report: PricingReport, reportLabel: string): ReportScorecard`
  - `buildHeadline(scorecards: ReportScorecard[]): string`

- [ ] **Step 1: Write the failing tests**

Create `web/lib/analytics/scorecard.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeReportScorecard, buildHeadline } from "./scorecard";
import type { PricingReport, ProductAnalytics } from "../data/types";

function product(overrides: Partial<ProductAnalytics>): ProductAnalytics {
  return {
    category: "Test",
    product: "Item",
    prices_lbp: {},
    own_price_lbp: null,
    competitor_avg_lbp: null,
    price_index: null,
    comparability: "high",
    tier: null,
    is_outlier: false,
    outlier_direction: null,
    ...overrides,
  };
}

function report(products: ProductAnalytics[]): PricingReport {
  return {
    meta: {
      client: "Stories",
      report_date: "2026-07-22",
      currency: "LBP",
      fx_usd_rate: 89600,
      fx_rate_date: "2026-07-20",
      fx_source: "test",
      own_brand: "Stories",
      competitors: ["Espresso Lab"],
    },
    products,
    categories: [],
    data_quality_warnings: [],
  };
}

describe("computeReportScorecard", () => {
  it("averages the signed LBP gap across comparable, priced items only", () => {
    const r = report([
      product({ own_price_lbp: 500000, competitor_avg_lbp: 400000, comparability: "high" }),
      product({ own_price_lbp: 300000, competitor_avg_lbp: 400000, comparability: "medium" }),
      product({ own_price_lbp: 900000, competitor_avg_lbp: 100000, comparability: "low" }),
      product({ own_price_lbp: null, competitor_avg_lbp: 400000 }),
    ]);

    const scorecard = computeReportScorecard(r, "Main Menu");

    expect(scorecard.reportLabel).toBe("Main Menu");
    expect(scorecard.itemCount).toBe(2);
    expect(scorecard.avgGapLbp).toBe(0);
  });

  it("counts outliers independently of the comparability filter used for the gap average", () => {
    const r = report([
      product({ own_price_lbp: 500000, competitor_avg_lbp: 400000, is_outlier: true, outlier_direction: "overpriced" }),
      product({ own_price_lbp: 300000, competitor_avg_lbp: 400000, is_outlier: true, outlier_direction: "underpriced" }),
      product({ own_price_lbp: 400000, competitor_avg_lbp: 400000, is_outlier: false }),
    ]);

    const scorecard = computeReportScorecard(r, "Main Menu");

    expect(scorecard.overpricedCount).toBe(1);
    expect(scorecard.underpricedCount).toBe(1);
  });

  it("returns a null gap when no items qualify", () => {
    const r = report([product({ own_price_lbp: null, competitor_avg_lbp: null })]);
    const scorecard = computeReportScorecard(r, "Empty");
    expect(scorecard.itemCount).toBe(0);
    expect(scorecard.avgGapLbp).toBeNull();
  });
});

describe("buildHeadline", () => {
  it("names groups above and below market when both exist", () => {
    const headline = buildHeadline([
      { reportLabel: "Main Menu", itemCount: 10, avgGapLbp: 15000, overpricedCount: 2, underpricedCount: 0 },
      { reportLabel: "Frozen Yogurt Bar", itemCount: 5, avgGapLbp: -20000, overpricedCount: 0, underpricedCount: 3 },
    ]);
    expect(headline).toBe("Priced above market in Main Menu; below market in Frozen Yogurt Bar.");
  });

  it("names only the above-market groups when nothing is below", () => {
    const headline = buildHeadline([
      { reportLabel: "Main Menu", itemCount: 10, avgGapLbp: 15000, overpricedCount: 2, underpricedCount: 0 },
    ]);
    expect(headline).toBe("Priced above market in Main Menu.");
  });

  it("falls back to an at-par message when nothing has a nonzero gap", () => {
    const headline = buildHeadline([
      { reportLabel: "Main Menu", itemCount: 10, avgGapLbp: 0, overpricedCount: 0, underpricedCount: 0 },
    ]);
    expect(headline).toBe("Pricing sits at par with market across all benchmarked categories.");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd web && npm run test -- scorecard.test.ts`
Expected: FAIL — `scorecard.ts` does not exist.

- [ ] **Step 3: Implement `scorecard.ts`**

Create `web/lib/analytics/scorecard.ts`:

```ts
import type { PricingReport } from "../data/types";

export interface ReportScorecard {
  reportLabel: string;
  itemCount: number;
  avgGapLbp: number | null;
  overpricedCount: number;
  underpricedCount: number;
}

export function computeReportScorecard(report: PricingReport, reportLabel: string): ReportScorecard {
  const withGap = report.products.filter(
    (p): p is typeof p & { own_price_lbp: number; competitor_avg_lbp: number } =>
      p.own_price_lbp !== null && p.competitor_avg_lbp !== null && p.comparability !== "low"
  );

  const itemCount = withGap.length;
  const avgGapLbp = itemCount
    ? Math.round(withGap.reduce((sum, p) => sum + (p.own_price_lbp - p.competitor_avg_lbp), 0) / itemCount)
    : null;

  return {
    reportLabel,
    itemCount,
    avgGapLbp,
    overpricedCount: report.products.filter((p) => p.is_outlier && p.outlier_direction === "overpriced").length,
    underpricedCount: report.products.filter((p) => p.is_outlier && p.outlier_direction === "underpriced").length,
  };
}

export function buildHeadline(scorecards: ReportScorecard[]): string {
  const above = scorecards.filter((s) => s.avgGapLbp !== null && s.avgGapLbp > 0).map((s) => s.reportLabel);
  const below = scorecards.filter((s) => s.avgGapLbp !== null && s.avgGapLbp < 0).map((s) => s.reportLabel);

  if (above.length && below.length) {
    return `Priced above market in ${above.join(", ")}; below market in ${below.join(", ")}.`;
  }
  if (above.length) {
    return `Priced above market in ${above.join(", ")}.`;
  }
  if (below.length) {
    return `Priced below market in ${below.join(", ")}.`;
  }
  return "Pricing sits at par with market across all benchmarked categories.";
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd web && npm run test -- scorecard.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/lib/analytics/scorecard.ts web/lib/analytics/scorecard.test.ts
git commit -m "feat: add per-report scorecard and headline analytics"
```

---

### Task 6: Executive Summary v2

**Files:**
- Modify: `web/components/ExecutiveSummary.tsx` (full rewrite)
- Modify: `web/components/ExecutiveSummary.test.tsx` (full rewrite)
- Delete: `web/lib/analytics/summary.ts`
- Delete: `web/lib/analytics/summary.test.ts`

**Interfaces:**
- Consumes: `ReportScorecard` and `buildHeadline` from Task 5; `formatDualCurrency` from `web/lib/format/currency.ts` (unchanged).
- Produces: `ExecutiveSummary({ scorecards, fxRate }: { scorecards: ReportScorecard[]; fxRate: number }) => JSX.Element` — replaces the old `ExecutiveSummary({ kpis })` signature entirely (no other file imports `computeSummaryKpis`/`SummaryKpis`, confirmed by `grep -rn computeSummaryKpis web/` returning only `page.tsx`, which Task 9 rewrites).

- [ ] **Step 1: Write the failing test**

Replace the full contents of `web/components/ExecutiveSummary.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ExecutiveSummary } from "./ExecutiveSummary";

describe("ExecutiveSummary", () => {
  it("renders a plain-language headline and one scorecard tile per report", () => {
    render(
      <ExecutiveSummary
        fxRate={89600}
        scorecards={[
          { reportLabel: "Main Menu", itemCount: 120, avgGapLbp: 45000, overpricedCount: 8, underpricedCount: 3 },
          { reportLabel: "Frozen Yogurt Bar", itemCount: 30, avgGapLbp: -20000, overpricedCount: 1, underpricedCount: 5 },
        ]}
      />
    );

    expect(screen.getByText("Priced above market in Main Menu; below market in Frozen Yogurt Bar.")).toBeInTheDocument();
    expect(screen.getByText("Main Menu")).toBeInTheDocument();
    expect(screen.getByText("120 items benchmarked")).toBeInTheDocument();
    expect(screen.getByText("Frozen Yogurt Bar")).toBeInTheDocument();
    expect(screen.getByText("30 items benchmarked")).toBeInTheDocument();
    expect(screen.getByText("20,000 LBP ($0.22)")).toBeInTheDocument();
    expect(screen.getByText(/average gap vs\. market — below market/)).toBeInTheDocument();
    expect(screen.getByText("8 above market · 3 below market")).toBeInTheDocument();
  });

  it("shows an em-dash when a report has no comparable priced items", () => {
    render(
      <ExecutiveSummary
        fxRate={89600}
        scorecards={[{ reportLabel: "Empty Group", itemCount: 0, avgGapLbp: null, overpricedCount: 0, underpricedCount: 0 }]}
      />
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd web && npm run test -- ExecutiveSummary.test.tsx`
Expected: FAIL — current component takes a `kpis` prop, not `scorecards`.

- [ ] **Step 3: Rewrite `ExecutiveSummary.tsx`**

Replace the full contents of `web/components/ExecutiveSummary.tsx`:

```tsx
import type { ReportScorecard } from "@/lib/analytics/scorecard";
import { buildHeadline } from "@/lib/analytics/scorecard";
import { formatDualCurrency } from "@/lib/format/currency";

export function ExecutiveSummary({ scorecards, fxRate }: { scorecards: ReportScorecard[]; fxRate: number }) {
  return (
    <section aria-label="Executive Summary" className="space-y-6">
      <p className="font-display text-2xl text-ocean">{buildHeadline(scorecards)}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scorecards.map((s) => (
          <ScorecardTile key={s.reportLabel} scorecard={s} fxRate={fxRate} />
        ))}
      </div>
    </section>
  );
}

function ScorecardTile({ scorecard, fxRate }: { scorecard: ReportScorecard; fxRate: number }) {
  const direction = scorecard.avgGapLbp === null
    ? null
    : scorecard.avgGapLbp > 0
      ? "above market"
      : scorecard.avgGapLbp < 0
        ? "below market"
        : "at par";
  const gapLabel = scorecard.avgGapLbp === null ? "—" : formatDualCurrency(Math.abs(scorecard.avgGapLbp), fxRate);

  return (
    <div className="border-t-2 border-ocean/15 pt-3">
      <p className="font-display text-lg text-ocean">{scorecard.reportLabel}</p>
      <p className="mt-1 text-sm text-ocean-muted">{scorecard.itemCount} items benchmarked</p>
      <p className="mt-2 font-display text-2xl text-ocean">{gapLabel}</p>
      <p className="text-xs text-ocean-muted">average gap vs. market{direction ? ` — ${direction}` : ""}</p>
      <p className="mt-2 text-xs text-ocean-muted">
        {scorecard.overpricedCount} above market · {scorecard.underpricedCount} below market
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd web && npm run test -- ExecutiveSummary.test.tsx`
Expected: PASS.

- [ ] **Step 5: Remove the now-unused `summary.ts`**

```bash
git rm web/lib/analytics/summary.ts web/lib/analytics/summary.test.ts
```

- [ ] **Step 6: Run the full frontend test suite**

Run: `cd web && npm run test`
Expected: all PASS — `page.tsx` will fail to type-check at this point since it still imports `computeSummaryKpis` and passes `kpis` to `ExecutiveSummary`; that's expected and fixed in Task 9. If the test runner errors on `page.tsx`, run `npm run test -- ExecutiveSummary.test.tsx scorecard.test.ts Section.test.tsx` instead to confirm just this task's tests pass in isolation.

- [ ] **Step 7: Commit**

```bash
git add web/components/ExecutiveSummary.tsx web/components/ExecutiveSummary.test.tsx
git commit -m "feat: replace Executive Summary with per-report scorecards and plain-language headline"
```

---

### Task 7: "Awaiting data" placeholder cards

**Files:**
- Create: `web/components/CategoriesInProgress.tsx`
- Test: `web/components/CategoriesInProgress.test.tsx`

**Interfaces:**
- Produces: `CategoriesInProgress({ categories }: { categories: string[] }) => JSX.Element`.

- [ ] **Step 1: Write the failing test**

Create `web/components/CategoriesInProgress.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CategoriesInProgress } from "./CategoriesInProgress";

describe("CategoriesInProgress", () => {
  it("renders one card per pending category, no numbers or charts", () => {
    render(<CategoriesInProgress categories={["Salads", "Pizza"]} />);
    expect(screen.getByText("Salads")).toBeInTheDocument();
    expect(screen.getByText("Pizza")).toBeInTheDocument();
    expect(screen.getAllByText("Data not yet available")).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd web && npm run test -- CategoriesInProgress.test.tsx`
Expected: FAIL — file does not exist.

- [ ] **Step 3: Create `CategoriesInProgress.tsx`**

Create `web/components/CategoriesInProgress.tsx`:

```tsx
export function CategoriesInProgress({ categories }: { categories: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" data-testid="categories-in-progress">
      {categories.map((category) => (
        <div key={category} className="rounded-lg border border-dashed border-ocean/20 p-4">
          <p className="font-display text-base text-ocean">{category}</p>
          <p className="mt-1 text-xs text-ocean-muted">Data not yet available</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd web && npm run test -- CategoriesInProgress.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/components/CategoriesInProgress.tsx web/components/CategoriesInProgress.test.tsx
git commit -m "feat: add awaiting-data placeholder cards for pending categories"
```

---

### Task 8: `<ReportSection>` — the reusable per-group mini-dashboard

**Files:**
- Create: `web/components/ReportSection.tsx`
- Test: `web/components/ReportSection.test.tsx`

**Interfaces:**
- Consumes: `Section` (Task 4); `PricingReport` (`web/lib/data/types.ts`); `prepareCategoryPositioning`, `groupOutlierFindings`, `buildCategoryPriceMap`, `buildCategoryBrandHeatmap` (all pre-existing, unchanged); `CategoryBrandHeatmap`, `CategoryPositioning`, `CategoryPriceMap`, `FindingsRecommendations`, `DataExplorer` (all pre-existing, unchanged). `FindingsRecommendations` requires a `PresenterModeProvider` ancestor (pre-existing constraint).
- Produces: `ReportSection({ title, report }: { title: string; report: PricingReport }) => JSX.Element`.

- [ ] **Step 1: Write the failing test**

Create `web/components/ReportSection.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReportSection } from "./ReportSection";
import { PresenterModeProvider } from "@/lib/presenter/PresenterModeContext";
import type { PricingReport } from "@/lib/data/types";

function buildReport(): PricingReport {
  return {
    meta: {
      client: "Stories",
      report_date: "2026-07-22",
      currency: "LBP",
      fx_usd_rate: 89600,
      fx_rate_date: "2026-07-20",
      fx_source: "test",
      own_brand: "Stories",
      competitors: ["Pinkberry"],
    },
    products: [
      {
        category: "Frozen Yogurt",
        product: "Original Yogurt SMALL",
        prices_lbp: { Stories: 500000, Pinkberry: 450000 },
        own_price_lbp: 500000,
        competitor_avg_lbp: 450000,
        price_index: 111.1,
        comparability: "high",
        tier: "Core",
        is_outlier: false,
        outlier_direction: null,
      },
    ],
    categories: [
      { category: "Frozen Yogurt", product_count: 1, countable_product_count: 1, avg_price_index: 111.1 },
    ],
    data_quality_warnings: [],
  };
}

describe("ReportSection", () => {
  it("renders the group title and all five sub-views", () => {
    render(
      <PresenterModeProvider>
        <ReportSection title="Frozen Yogurt Bar" report={buildReport()} />
      </PresenterModeProvider>
    );

    expect(screen.getByRole("heading", { level: 2, name: "Frozen Yogurt Bar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Competitive Landscape at a Glance" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Category Positioning" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Price Positioning Map" })).toBeInTheDocument();
    expect(screen.getByText("Findings & Recommendations")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Full Data Explorer" })).toBeInTheDocument();
    expect(screen.getByTestId("category-brand-heatmap")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd web && npm run test -- ReportSection.test.tsx`
Expected: FAIL — file does not exist.

- [ ] **Step 3: Create `ReportSection.tsx`**

Create `web/components/ReportSection.tsx`:

```tsx
import type { PricingReport } from "@/lib/data/types";
import { prepareCategoryPositioning } from "@/lib/analytics/categoryPositioning";
import { groupOutlierFindings } from "@/lib/analytics/findings";
import { buildCategoryPriceMap } from "@/lib/analytics/positioningMap";
import { buildCategoryBrandHeatmap } from "@/lib/analytics/heatmap";
import { CategoryBrandHeatmap } from "@/components/CategoryBrandHeatmap";
import { CategoryPositioning } from "@/components/CategoryPositioning";
import { CategoryPriceMap } from "@/components/CategoryPriceMap";
import { FindingsRecommendations } from "@/components/FindingsRecommendations";
import { DataExplorer } from "@/components/DataExplorer";
import { Section } from "@/components/Section";

export function ReportSection({ title, report }: { title: string; report: PricingReport }) {
  const positioningRows = prepareCategoryPositioning(report.categories);
  const findings = groupOutlierFindings(report.products);
  const priceMapRows = buildCategoryPriceMap(report.products, report.meta.own_brand);
  const allBrands = [report.meta.own_brand, ...report.meta.competitors];
  const heatmapRows = buildCategoryBrandHeatmap(priceMapRows, allBrands);

  return (
    <section aria-label={title} className="border-b border-ocean/10 pb-12 pt-12">
      <h2 className="mb-6 font-display text-2xl text-ocean">{title}</h2>

      <Section title="Competitive Landscape at a Glance" level={3}>
        <p className="mb-5 max-w-2xl text-sm text-ocean-muted">
          Every category against every brand in one grid — each cell is that brand&apos;s average price
          relative to the other brands priced in that category (100 = at par with peers). Red = priced above
          peers, violet = priced below. A blank cell means that brand doesn&apos;t sell in that category at
          all; a light gray cell with a price on it means the item is priced but no competitor sells there to
          benchmark against — see the full legend below the grid. {report.meta.client}&apos;s column is
          outlined.
        </p>
        <CategoryBrandHeatmap rows={heatmapRows} brands={allBrands} ownBrand={report.meta.own_brand} />
      </Section>

      <Section title="Category Positioning" level={3}>
        <p className="mb-5 max-w-2xl text-sm text-ocean-muted">
          A closer, {report.meta.client}-focused view: how far {report.meta.client} sits above or below the
          competitor-only average in each category. This is the same relationship as the heatmap above, isolated
          to {report.meta.client} and shown as a deviation from market rather than an index.
        </p>
        <CategoryPositioning rows={positioningRows} />
      </Section>

      <Section title="Price Positioning Map" level={3}>
        <p className="mb-5 max-w-2xl text-sm text-ocean-muted">
          Every brand&apos;s average price per category. {report.meta.client} is shown in Ocean with a bold
          outline; each competitor has its own color (see legend). The shaded band marks the competitor price
          range — where {report.meta.client}&apos;s dot falls inside, at the edge, or outside that band is the
          read. Filter to a single category for a closer look.
        </p>
        <CategoryPriceMap rows={priceMapRows} fxRate={report.meta.fx_usd_rate} ownBrand={report.meta.own_brand} />
      </Section>

      <FindingsRecommendations findings={findings} fxRate={report.meta.fx_usd_rate} />

      <Section title="Full Data Explorer" level={3} last>
        <p className="mb-5 max-w-2xl text-sm text-ocean-muted">
          Every priced line item, with search, filters, and sortable columns. Click a row to see every brand&apos;s
          price for that item side by side — not just {report.meta.client}&apos;s.
        </p>
        <DataExplorer products={report.products} fxRate={report.meta.fx_usd_rate} ownBrand={report.meta.own_brand} />
      </Section>
    </section>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd web && npm run test -- ReportSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/components/ReportSection.tsx web/components/ReportSection.test.tsx
git commit -m "feat: add reusable ReportSection component for per-group mini-dashboards"
```

---

### Task 9: Wire `page.tsx` to compose all three reports

**Files:**
- Modify: `web/app/page.tsx` (full rewrite of the `Home` function body)

**Interfaces:**
- Consumes: `loadReport` (`web/lib/data/loadReport.ts`, unchanged); `computeReportScorecard` (Task 5); `ExecutiveSummary` (Task 6); `ReportSection` (Task 8); `CategoriesInProgress` (Task 7); `Section` (Task 4); existing `ContextBar`, `Methodology`, `PresenterModeToggle`, `PresenterModeProvider` (all unchanged).
- Produces: the composed page — no new exports, this is the app's entry point.

This task has no dedicated automated test (matching the existing codebase, which has no `page.test.tsx`) — verified by the full test suite plus a manual `npm run build` in Step 3.

- [ ] **Step 1: Rewrite `web/app/page.tsx`**

Replace the full contents of `web/app/page.tsx`:

```tsx
import { loadReport } from "@/lib/data/loadReport";
import { withBasePath } from "@/lib/basePath";
import { formatReportPeriod } from "@/lib/format/date";
import { cleanDisplayFileName } from "@/lib/format/filename";
import { computeReportScorecard } from "@/lib/analytics/scorecard";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { ReportSection } from "@/components/ReportSection";
import { CategoriesInProgress } from "@/components/CategoriesInProgress";
import { PresenterModeToggle } from "@/components/PresenterModeToggle";
import { ContextBar } from "@/components/ContextBar";
import { Methodology } from "@/components/Methodology";
import { Section } from "@/components/Section";
import { PresenterModeProvider } from "@/lib/presenter/PresenterModeContext";

const PENDING_CATEGORIES = [
  "Milkshakes",
  "Protein Shakes",
  "Salads",
  "Sandwiches",
  "Pizza",
  "Wraps",
  "Gluten Free",
  "Luxury Toppings",
  "Plat Du Jour",
];

export default function Home() {
  const mainReport = loadReport("stories-pricing-2026-03");
  const frozenYogurtReport = loadReport("stories-frozen-yogurt-2026-07");
  const nonDairyReport = loadReport("stories-non-dairy-2026-07");

  const scorecards = [
    computeReportScorecard(mainReport, "Main Menu"),
    computeReportScorecard(frozenYogurtReport, "Frozen Yogurt Bar"),
    computeReportScorecard(nonDairyReport, "Non-Dairy Menu"),
  ];

  return (
    <PresenterModeProvider>
      {/* Cover */}
      <div className="border-b border-ocean/10 bg-white px-6 pb-10 pt-8">
        <div className="mx-auto flex max-w-6xl items-start justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBasePath("/ruya-logo.jpg")} alt="Ru'ya 360" className="h-9 w-auto" />
          <PresenterModeToggle />
        </div>
        <div className="mx-auto mt-10 max-w-6xl">
          <p className="text-xs uppercase tracking-widest text-ocean-muted">Pricing Strategy Advisory</p>
          <h1 className="mt-2 font-display text-4xl text-ocean sm:text-5xl">Stories Pricing Benchmark</h1>
          <p className="mt-3 max-w-2xl text-sm text-ocean-muted">
            A full-menu competitive price positioning analysis for {mainReport.meta.client}, broken out by
            category group — each benchmarked against its own set of competitors.
          </p>
        </div>
      </div>

      <ContextBar meta={mainReport.meta} />

      <main className="mx-auto max-w-6xl px-6">
        <Section title="Executive Summary" first>
          <ExecutiveSummary scorecards={scorecards} fxRate={mainReport.meta.fx_usd_rate} />
        </Section>

        <Section title="Methodology & Data Sources">
          <Methodology meta={mainReport.meta} warnings={mainReport.data_quality_warnings} />
        </Section>

        <ReportSection title="Main Menu" report={mainReport} />
        <ReportSection title="Frozen Yogurt Bar" report={frozenYogurtReport} />
        <ReportSection title="Non-Dairy Menu" report={nonDairyReport} />

        <Section title="Categories In Progress" last>
          <p className="mb-5 max-w-2xl text-sm text-ocean-muted">
            These categories are moving to their own dedicated competitor comparison — shown here once{" "}
            {mainReport.meta.client} provides that data.
          </p>
          <CategoriesInProgress categories={PENDING_CATEGORIES} />
        </Section>
      </main>

      <footer className="mt-4 border-t border-ocean/10 bg-ocean/5 px-6 py-6 text-xs text-ocean-muted">
        <div className="mx-auto max-w-6xl">
          <p>Confidential — prepared for {mainReport.meta.client} by Ru&apos;ya 360. Not for external distribution.</p>
          <p className="mt-1">
            Report period: {formatReportPeriod(mainReport.meta.report_date)} · Source:{" "}
            {mainReport.meta.generated_from ? cleanDisplayFileName(mainReport.meta.generated_from) : "internal pricing data"}.
          </p>
        </div>
      </footer>
    </PresenterModeProvider>
  );
}
```

- [ ] **Step 2: Run the full frontend test suite**

Run: `cd web && npm run test`
Expected: all PASS, including every test from Tasks 4–8.

- [ ] **Step 3: Regenerate processed data and build the static export**

Run:
```bash
cd /home/casio699/kenaan/data
bash scripts/build_reports.sh
cd web
npm run build
```
Expected: build succeeds with no errors. (`processed/*.json` should already exist from Task 3's integration test, but re-running `build_reports.sh` here confirms the exact data the build will ship with is current.)

- [ ] **Step 4: Manually verify in the browser**

Run: `cd web && npm run dev`, open `http://localhost:3000`. Confirm:
- Executive Summary shows a plain-language headline and three scorecards (Main Menu, Frozen Yogurt Bar, Non-Dairy Menu), no bare "Price Index" number as the lead figure.
- Three full mini-dashboards appear in order (Main Menu, Frozen Yogurt Bar, Non-Dairy Menu), each with its own heatmap, positioning chart, price map, findings, and data explorer.
- Main Menu's heatmap does **not** include Milkshakes, Protein Shakes, Salads, Sandwiches, Frozen Yogurt, Toppings, Luxury Toppings, Pizza, Wraps, Gluten Free, or Plat Du Jour.
- Frozen Yogurt Bar's heatmap columns are Stories, Pinkberry, Cremino, Fro - U (Cremino column blank/pending throughout).
- Non-Dairy Menu's heatmap columns are Stories, Espresso Lab, Dunkin Donuts, Joe & the Juice, Starbucks.
- "Categories In Progress" shows 9 plain cards with no numbers, at the bottom of the page.
- The Presenter Mode toggle still hides/shows all three Findings & Recommendations blocks together.

- [ ] **Step 5: Commit**

```bash
git add web/app/page.tsx
git commit -m "feat: compose Main Menu, Frozen Yogurt Bar, and Non-Dairy Menu reports on one page"
```
