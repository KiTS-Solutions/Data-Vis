"""
Derives a per-brand portion-size (grams) disclosure for the Salads report.

The source sheet used to carry a dedicated 3-column "PORTION SIZE (g)" side
table with one row per brand (a hand-curated policy summary). That table was
dropped from the sheet in the 2026-07-30 refresh. What remains is the
per-product, per-brand portion note already captured on each priced row
(e.g. "440 g." next to a competitor's price) and already extracted into
`portion_note` on each normalized record by parse_pricing. This module
aggregates those per-product notes into a per-brand min/max range instead,
reading the already-normalized JSON rather than the raw sheet — no reason to
re-parse the workbook for data parse_pricing already extracted.
"""

import re

_GRAM_RE = re.compile(r"(\d+(?:\.\d+)?)")


def _parse_grams(note):
    if note is None:
        return None
    match = _GRAM_RE.search(note)
    if not match:
        return None
    value = float(match.group(1))
    return int(value) if value.is_integer() else value


def build_portion_summary(records: list, own_brand: str, competitors: list) -> dict:
    brands = [own_brand, *competitors]
    grams_by_brand = {brand: [] for brand in brands}

    for record in records:
        grams = _parse_grams(record.get("portion_note"))
        if grams is None:
            continue
        brand = record["brand"]
        if brand in grams_by_brand:
            grams_by_brand[brand].append(grams)

    rows = []
    for brand in brands:
        values = grams_by_brand[brand]
        if not values:
            rows.append({
                "brand": brand,
                "items_with_portion_data": 0,
                "min_g": None,
                "max_g": None,
                "consistent": False,
            })
            continue
        rows.append({
            "brand": brand,
            "items_with_portion_data": len(values),
            "min_g": min(values),
            "max_g": max(values),
            "consistent": min(values) == max(values),
        })

    return {"rows": rows}


import argparse
import json
import os


def run_pipeline(normalized_json_path: str, output_path: str) -> dict:
    with open(normalized_json_path, "r", encoding="utf-8") as f:
        normalized = json.load(f)

    meta = normalized["meta"]
    summary = build_portion_summary(normalized["records"], meta["own_brand"], meta["competitors"])
    result = {
        "meta": {"client": meta["client"], "generated_from": normalized_json_path},
        **summary,
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    return result


def _build_arg_parser():
    parser = argparse.ArgumentParser(
        description="Derive a per-brand portion-size (grams) summary from normalized pricing records."
    )
    parser.add_argument("--in", dest="input_path", required=True, help="Path to the normalized JSON")
    parser.add_argument("--out", required=True, help="Path to write the portion-size summary JSON")
    return parser


def main(argv=None):
    args = _build_arg_parser().parse_args(argv)
    run_pipeline(args.input_path, args.out)


if __name__ == "__main__":
    main()
