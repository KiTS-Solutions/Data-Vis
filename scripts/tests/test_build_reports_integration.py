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
