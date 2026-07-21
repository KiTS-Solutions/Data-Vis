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
