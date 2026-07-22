# Price Reconciliation: Official Menu Prices vs. Comparison Spreadsheets

**Date:** 2026-07-22
**Status:** APPLIED 2026-07-22. Management confirmed the official POS file (`raw-data/officially provided Menu Stories prices.xlsx`) is authoritative. All 34 corrections below were applied directly to the two raw source Excel files (`Product Pricing Comparison March 2026 (1).xlsx` and `Frozen Yogurt Pricing Comparison (1).xlsx`), matched on **category + exact product name** (not name alone — an earlier draft of this correction incorrectly matched "Chocolate Chips" by name only and corrupted an unrelated Add-Ons item; caught and fixed before saving). One item from §1 (Quinoa Salad) needed no correction — the new dedicated Salads source file already has the official 800,000 price. §2 (systematic mismatch) was a false positive, already resolved — no action needed.

### What was corrected (34 items, both source files)

| Category | Product | Old Price | New (Official) Price |
|---|---|---|---|
| Gluten Free | Almond Croissant | 750,000 | 400,000 |
| Gluten Free | Carrot Cake | 550,000 | 500,000 |
| Gluten Free | Cheese Croissant | 600,000 | 400,000 |
| Gluten Free | Thyme Croissant | 600,000 | 350,000 |
| Luxury Toppings | Chocolate Crunch | 170,000 | 250,000 |
| Luxury Toppings | Chocolate Quella | 170,000 | 250,000 |
| Luxury Toppings | Chocolate Quella Crunch | 170,000 | 250,000 |
| Luxury Toppings | Nutella | 150,000 | 250,000 |
| Luxury Toppings | Pistachio Crunch | 170,000 | 250,000 |
| Luxury Toppings | Variegato Wafer Pistachio | 170,000 | 250,000 |
| Mixed Cold Beverages | Iced Spanish Latte MEDIUM | 500,000 | 550,000 |
| Pastries | Brownies Cake | 250,000 | 350,000 |
| Plat Du Jour | Freekeh With Chicken | 1,650,500 | 1,165,500 |
| Plat Du Jour | Lasagna | 1,650,500 | 1,165,500 |
| Plat Du Jour | Oriental Rice | 1,650,500 | 1,165,500 |
| Plat Du Jour | Shish Barak | 1,650,500 | 1,165,500 |
| Plat Du Jour | Spaghetti Bolognese | 1,650,500 | 1,165,500 |
| Plat Du Jour | Vegetarian Grape Leaves | 1,650,500 | 1,165,500 |
| Toppings (both files) | Blueberries | 120,000 | 200,000 |
| Toppings (both files) | Brownies | 100,000 | 200,000 |
| Toppings (both files) | Chocolate Chips | 120,000 | 200,000 |
| Toppings (both files) | Granolla | 100,000 | 150,000 |
| Toppings (both files) | Gummy Bears | 100,000 | 150,000 |
| Toppings (both files) | Honey | 120,000 | 200,000 |
| Toppings (both files) | Lotus Biscuits | 100,000 | 150,000 |
| Toppings (both files) | Mango | 120,000 | 200,000 |
| Toppings (both files) | Marshmallow | 100,000 | 150,000 |
| Toppings (both files) | Mixed Nuts | 100,000 | 150,000 |
| Toppings (both files) | Oats | 100,000 | 150,000 |
| Toppings (both files) | Oreo | 100,000 | 150,000 |
| Toppings (both files) | Pineapple | 120,000 | 200,000 |
| Toppings (both files) | Sprinkles | 100,000 | 150,000 |
| Toppings (both files) | Strawberry | 120,000 | 200,000 |
| Toppings (both files) | Wafer Roll | 100,000 | 150,000 |

Gluten Free, Luxury Toppings, and Plat Du Jour are still in `dropped_categories` (awaiting their own competitor data, per the table-decomposition spec), so these corrections aren't visible on the live dashboard yet — they'll take effect automatically once those sections ship, since the raw source is now correct. Mixed Cold Beverages, Pastries, and Toppings (via Frozen Yogurt Bar) are live now and reflect the corrected prices immediately.

## Method

Compared `raw-data/officially provided Menu Stories prices.xlsx` (Stories' own POS export, confirmed as source of truth) against the "Stories" price column in each comparison spreadsheet, matched by normalized product name (case/whitespace-insensitive exact match only — no fuzzy matching).

## 1. Scattered mismatches — 33 items, isolated, look like real one-off price changes

These read like ordinary price updates the comparison sheets hadn't caught yet — no consistent pattern, mix of increases and decreases, mostly in categories that are moving out of the main table anyway (Gluten Free, Luxury Toppings, Toppings, Plat Du Jour, Salads — all pending/placeholder categories per the table-decomposition spec) or isolated single items in categories staying put (Pastries, Mixed Cold Beverages).

| Category | Product | Source File | Sheet Price | Official Price | Diff | % |
|---|---|---|---|---|---|---|
| Gluten Free | Almond Croissant | master | 750,000 | 400,000 | −350,000 | −46.7% |
| Gluten Free | Carrot Cake | master | 550,000 | 500,000 | −50,000 | −9.1% |
| Gluten Free | Cheese Croissant | master | 600,000 | 400,000 | −200,000 | −33.3% |
| Gluten Free | Thyme Croissant | master | 600,000 | 350,000 | −250,000 | −41.7% |
| Luxury Toppings | Chocolate Crunch | master | 170,000 | 250,000 | +80,000 | +47.1% |
| Luxury Toppings | Chocolate Quella | master | 170,000 | 250,000 | +80,000 | +47.1% |
| Luxury Toppings | Chocolate Quella Crunch | master | 170,000 | 250,000 | +80,000 | +47.1% |
| Luxury Toppings | Nutella | master | 150,000 | 250,000 | +100,000 | +66.7% |
| Luxury Toppings | Pistachio Crunch | master | 170,000 | 250,000 | +80,000 | +47.1% |
| Luxury Toppings | Variegato Wafer Pistachio | master | 170,000 | 250,000 | +80,000 | +47.1% |
| Mixed Cold Beverages | Iced Spanish Latte MEDIUM | master | 500,000 | 550,000 | +50,000 | +10.0% |
| Pastries | Brownies Cake | master | 250,000 | 350,000 | +100,000 | +40.0% |
| Plat Du Jour | Freekeh With Chicken | master | 1,650,500 | 1,165,500 | −485,000 | −29.4% |
| Plat Du Jour | Lasagna | master | 1,650,500 | 1,165,500 | −485,000 | −29.4% |
| Plat Du Jour | Oriental Rice | master | 1,650,500 | 1,165,500 | −485,000 | −29.4% |
| Plat Du Jour | Shish Barak | master | 1,650,500 | 1,165,500 | −485,000 | −29.4% |
| Plat Du Jour | Spaghetti Bolognese | master | 1,650,500 | 1,165,500 | −485,000 | −29.4% |
| Plat Du Jour | Vegetarian Grape Leaves | master | 1,650,500 | 1,165,500 | −485,000 | −29.4% |
| Salads | Quinoa Salad (Grab&Go) | master | 770,000 | 800,000 | +30,000 | +3.9% |
| Toppings | Blueberries, Brownies, Chocolate Chips, Granolla, Gummy Bears, Honey, Lotus Biscuits, Mango, Marshmallow, Mixed Nuts, Oats, Oreo, Pineapple, Sprinkles, Strawberry, Wafer Roll | master + frozen_yogurt (both files agree with each other, both disagree with official) | 100,000–120,000 | 150,000–200,000 | +50,000 to +100,000 | +50% to +100% |

Note the six identical "Plat Du Jour" mains all show the *same* official price (1,165,500) regardless of dish — consistent with a flat "dish of the day" price in the POS regardless of which specific dish, rather than a data error.

## 2. Resolved — not a data error: different products, not a price mismatch

An earlier pass of this check flagged what looked like a systematic ~27–50% mismatch across every matched item in the **Non-Dairy Product Pricing Comparison** file's Mixed Hot Beverages, Mixed Cold Beverages, Signature, and Blended Drinks categories (100% of matched items disagreeing with official, always in the same direction — e.g. Latte MEDIUM at 600,000 in that sheet vs. 400,000 official).

**The user clarified this is not a data quality issue.** Items in the Non-Dairy file (e.g. "Cappuccino") are a genuinely different, non-dairy-alternative product from the same-named item in the master file and the official list — not an updated price for the same SKU. The two "Cappuccino"s are different drinks that happen to share a name, which is exactly what my exact-name matching can't tell apart. Confirmed directly: master's original Cappuccino Medium (400,000 LBP) already matches the official price (400,000 LBP) — it's the Non-Dairy sheet's Cappuccino Medium (600,000 LBP) that's a different item, not a disagreement about the same one.

**Consequence for the table-decomposition work:** the Non-Dairy file's five categories are not a refresh of any main-table category — they form their own standalone "Non-Dairy Menu" report (see the updated table-decomposition spec, §2–3). No price correction is needed here; this was never a discrepancy to resolve.

## What I need from you

For the 33 scattered items in §1: apply official → these are ready to apply as soon as you have a management answer. Nothing else in this document is blocking anything else — the table-decomposition implementation plan proceeds independently using the comparison sheets' current numbers, since none of the 33 affect a category with build-blocking ambiguity.
