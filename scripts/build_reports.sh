#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH=scripts

# Main Menu — master file, minus the categories in dropped_categories.
"${PYTHON:-python3}" -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/Product Pricing Comparison March 2026 (1).xlsx" \
  --config sources/stories-pricing-2026-03.json \
  --out processed/stories-pricing-2026-03.normalized.json
"${PYTHON:-python3}" -m pricing_pipeline.analyze_pricing \
  --in processed/stories-pricing-2026-03.normalized.json \
  --out processed/stories-pricing-2026-03.json

# Frozen Yogurt Bar — Frozen Yogurt + Toppings, competitors Pinkberry/Cremino/Fro - U.
"${PYTHON:-python3}" -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/Frozen Yogurt Pricing Comparison (1).xlsx" \
  --config sources/stories-frozen-yogurt-2026-07.json \
  --out processed/stories-frozen-yogurt-2026-07.normalized.json
"${PYTHON:-python3}" -m pricing_pipeline.analyze_pricing \
  --in processed/stories-frozen-yogurt-2026-07.normalized.json \
  --out processed/stories-frozen-yogurt-2026-07.json

# Non-Dairy Menu — Mixed Hot/Cold Beverages, Blended Drinks, Signature, Protein
# Shakes (non-dairy-alternative versions), standard 4 competitors.
"${PYTHON:-python3}" -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/Non Dairy Product Pricing Comparison (1) (1).xlsx" \
  --config sources/stories-non-dairy-2026-07.json \
  --out processed/stories-non-dairy-2026-07.normalized.json
"${PYTHON:-python3}" -m pricing_pipeline.analyze_pricing \
  --in processed/stories-non-dairy-2026-07.normalized.json \
  --out processed/stories-non-dairy-2026-07.json

# Salads — competitors Wooden Bakery/Zaatar w Zeit/Casper & Gambini/The
# Koozspace. Gap-analysis items (competitor salads not on Stories' menu)
# folded into the same SALADS category via category_aliases.
"${PYTHON:-python3}" -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/Salads_Pricing_Comparison.xlsx" \
  --config sources/stories-salads-2026-07.json \
  --out processed/stories-salads-2026-07.normalized.json
"${PYTHON:-python3}" -m pricing_pipeline.analyze_pricing \
  --in processed/stories-salads-2026-07.normalized.json \
  --out processed/stories-salads-2026-07.json

# Plat Du Jour — competitors Socrate (Beirut)/Ana Beirut/abdel Wahab/Diwan Beirut.
"${PYTHON:-python3}" -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/plat-de-jour-price-comparison.xlsx" \
  --config sources/stories-plat-du-jour-2026-07.json \
  --out processed/stories-plat-du-jour-2026-07.normalized.json
"${PYTHON:-python3}" -m pricing_pipeline.analyze_pricing \
  --in processed/stories-plat-du-jour-2026-07.normalized.json \
  --out processed/stories-plat-du-jour-2026-07.json

# Sandwiches — non-standard sheet layout (title/subtitle preamble, product
# identity split across Item + Bread Type, derived summary columns), so it
# uses the dedicated parse_sandwiches parser instead of parse_pricing.
"${PYTHON:-python3}" -m pricing_pipeline.parse_sandwiches \
  --xlsx "raw-data/Sandwich_Price_Comparison_2026.xlsx" \
  --config sources/stories-sandwiches-2026-07.json \
  --out processed/stories-sandwiches-2026-07.normalized.json
"${PYTHON:-python3}" -m pricing_pipeline.analyze_pricing \
  --in processed/stories-sandwiches-2026-07.normalized.json \
  --out processed/stories-sandwiches-2026-07.json
