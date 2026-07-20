from pricing_pipeline.analyze_pricing import build_product_analytics, build_category_rollups


def _records():
    return [
        # Americano MEDIUM: high comparability (3 competitors priced)
        {"category": "Hot", "product": "Americano MEDIUM", "brand": "Stories", "price_lbp": 350000},
        {"category": "Hot", "product": "Americano MEDIUM", "brand": "Espresso Lab", "price_lbp": 400000},
        {"category": "Hot", "product": "Americano MEDIUM", "brand": "Joe & the Juice", "price_lbp": 358000},
        {"category": "Hot", "product": "Americano MEDIUM", "brand": "Starbucks", "price_lbp": 350000},
        # Decaf Espresso: low comparability (0 competitors priced against Stories — Stories has no price)
        {"category": "Hot", "product": "Decaf Espresso", "brand": "Dunkin Donuts", "price_lbp": 270000},
    ]


def test_build_product_analytics_computes_index_and_comparability():
    products = build_product_analytics(_records(), "Stories", ["Espresso Lab", "Dunkin Donuts", "Joe & the Juice", "Starbucks"])

    americano = next(p for p in products if p["product"] == "Americano MEDIUM")
    assert americano["own_price_lbp"] == 350000
    assert americano["comparability"] == "high"
    assert americano["price_index"] == 94.8

    decaf = next(p for p in products if p["product"] == "Decaf Espresso")
    assert decaf["own_price_lbp"] is None
    assert decaf["price_index"] is None
    assert decaf["comparability"] == "low"


def test_build_category_rollups_excludes_low_comparability():
    products = build_product_analytics(_records(), "Stories", ["Espresso Lab", "Dunkin Donuts", "Joe & the Juice", "Starbucks"])
    rollups = build_category_rollups(products)

    hot = next(r for r in rollups if r["category"] == "Hot")
    assert hot["product_count"] == 2
    assert hot["countable_product_count"] == 1
    assert hot["avg_price_index"] == 94.8
