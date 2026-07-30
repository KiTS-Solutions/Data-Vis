# Stories Pricing Benchmark Dashboard

A comprehensive competitive pricing analysis dashboard for Stories, comparing menu prices across multiple categories against relevant competitors. The project combines a Python data processing pipeline with a Next.js visualization frontend.

## Overview

This dashboard provides Stories with detailed pricing intelligence across their menu categories:

- **Main Menu**: Drinks (coffee, beverages, tea) and Bakery (croissants, pastries)
- **Frozen Yogurt Bar**: Frozen yogurt with toppings, including cup/gram size comparisons
- **Non-Dairy Menu**: Non-dairy beverage alternatives
- **Salads**: Fresh salads with portion size analysis
- **Plat Du Jour**: Daily specials
- **Sandwiches**: Sandwich offerings

Each category is benchmarked against a tailored set of relevant competitors, with analytics including price indices, tier classifications, and outlier detection.

## Project Structure

```
.
├── raw-data/              # Source Excel pricing comparison spreadsheets
├── sources/               # JSON configuration files for each report
├── processed/             # Generated JSON analytics (pipeline output)
├── scripts/
│   └── pricing_pipeline/ # Python data processing modules
│       ├── parse_pricing.py      # Main pricing spreadsheet parser
│       ├── parse_sandwiches.py   # Sandwich-specific parser
│       ├── parse_cup_sizes.py    # Frozen yogurt cup size parser
│       ├── parse_gram_sizes.py   # Frozen yogurt gram weight parser
│       ├── parse_portion_sizes.py # Salads portion size parser
│       ├── analyze_pricing.py    # Analytics engine (indices, tiers, outliers)
│       └── config.py             # Configuration validation
├── web/                   # Next.js dashboard application
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and data loading
│   └── public/           # Static assets (logos, images)
├── docs/                 # Documentation and analysis notes
├── Branding/             # Brand assets (colors, fonts, logos)
└── scripts/build_reports.sh  # Pipeline orchestration script
```

## Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm (or yarn/pnpm/bun)

### Python Dependencies

```bash
pip install -r requirements.txt
```

### Web Dependencies

```bash
cd web
npm install
```

## Running the Data Pipeline

The pipeline processes raw Excel spreadsheets into normalized JSON analytics.

### Process All Reports

```bash
bash scripts/build_reports.sh
```

### Process Individual Reports

Each report requires two steps: parsing the Excel source, then running analytics.

**Main Menu:**
```bash
python3 -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/Product Pricing Comparison March 2026 (1) (2) (1).xlsx" \
  --config sources/stories-pricing-2026-03.json \
  --out processed/stories-pricing-2026-03.normalized.json

python3 -m pricing_pipeline.analyze_pricing \
  --in processed/stories-pricing-2026-03.normalized.json \
  --out processed/stories-pricing-2026-03.json
```

**Frozen Yogurt Bar:**
```bash
python3 -m pricing_pipeline.parse_pricing \
  --xlsx "raw-data/Frozen Yogurt Pricing Comparison (1).xlsx" \
  --config sources/stories-frozen-yogurt-2026-07.json \
  --out processed/stories-frozen-yogurt-2026-07.normalized.json

python3 -m pricing_pipeline.analyze_pricing \
  --in processed/stories-frozen-yogurt-2026-07.normalized.json \
  --out processed/stories-frozen-yogurt-2026-07.json
```

Additional parsers for cup sizes, gram sizes, and portion sizes follow the same pattern.

## Running the Web Dashboard

### Development

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Production Build

```bash
cd web
npm run build
npm start
```

### Static Export

The dashboard is configured for static export (GitHub Pages compatible):

```bash
cd web
npm run build
```

Output is in `web/out/`.

## Testing

### Python Tests

```bash
pytest
```

### Web Tests

```bash
cd web
npm run test
```

## Deployment

The project uses GitHub Actions for automatic deployment to GitHub Pages:

1. Push to `main` branch triggers the workflow
2. Pipeline regenerates processed data from source spreadsheets
3. Web app builds and tests
4. Static export deploys to GitHub Pages

Manual deployment available via workflow_dispatch in GitHub Actions UI.

## Data Pipeline Architecture

### Parsing Stage

Each Excel spreadsheet is parsed into a normalized JSON structure with:
- **Records**: Individual product pricing entries (category, product, brand, price)
- **Metadata**: Report configuration (client, date, currency, FX rates, competitors)
- **Warnings**: Data quality issues (duplicate rows, unparseable prices)

### Analytics Stage

The analytics engine computes:

- **Price Index**: Own brand price vs. competitor average (100 = parity)
- **Price Tiers**: Value/Core/Premium classification based on quartile analysis
- **Outlier Detection**: Items with price index deviation ≥15% from parity
- **Comparability**: Data quality flag (high/medium/low based on competitor coverage)
- **Category Rollups**: Aggregated metrics per category

### Specialized Parsers

- **parse_sandwiches.py**: Handles non-standard sandwich spreadsheet layout
- **parse_cup_sizes.py**: Extracts frozen yogurt cup size (oz) comparison tables
- **parse_gram_sizes.py**: Extracts frozen yogurt gram weight comparison tables
- **parse_portion_sizes.py**: Derives salad portion sizes from per-product notes

## Configuration

Each report requires a JSON configuration file in `sources/` with:

```json
{
  "client": "Stories",
  "report_date": "2026-03",
  "currency": "LBP",
  "fx_usd_rate": 95000,
  "fx_rate_date": "2026-03-15",
  "fx_source": "Central Bank of Lebanon",
  "own_brand": "Stories",
  "competitors": ["Competitor A", "Competitor B", "Competitor C"],
  "dropped_categories": ["Category to exclude"],
  "category_aliases": { "Source Category": "Normalized Category" }
}
```

## Documentation

- `docs/price-reconciliation-2026-07-22.md` - Detailed price correction log and methodology
- `web/AGENTS.md` - Next.js agent development guidelines
- `web/CLAUDE.md` - AI assistant context for the web application

## Brand Assets

Brand guidelines, color palette, fonts, and logos are in the `Branding/` directory for reference when making UI updates.

## License

Confidential - prepared for Stories by Ru'ya 360. Not for external distribution.
