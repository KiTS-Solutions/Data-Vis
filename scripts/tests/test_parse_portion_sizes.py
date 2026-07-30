from pricing_pipeline.parse_portion_sizes import build_portion_summary


def _record(brand, product, portion_note, price=100000, category="SALADS"):
    return {
        "category": category,
        "product": product,
        "brand": brand,
        "price_lbp": price,
        "price_usd": 1.0,
        "portion_note": portion_note,
    }


def test_build_portion_summary_computes_min_max_range_per_brand():
    records = [
        _record("Stories", "Tuna Pasta Salad", "440 g."),
        _record("Stories", "Quinoa Salad", "320 g."),
        _record("Wooden Bakery", "Tuna Pasta Salad", "550 g."),
    ]
    result = build_portion_summary(records, "Stories", ["Wooden Bakery"])
    rows = {r["brand"]: r for r in result["rows"]}

    assert rows["Stories"] == {
        "brand": "Stories",
        "items_with_portion_data": 2,
        "min_g": 320,
        "max_g": 440,
        "consistent": False,
    }
    assert rows["Wooden Bakery"]["min_g"] == 550
    assert rows["Wooden Bakery"]["max_g"] == 550


def test_build_portion_summary_flags_a_brand_priced_at_one_size_everywhere_as_consistent():
    records = [
        _record("Zaatar w Zeit", "Caesar Salad", "360 g."),
        _record("Zaatar w Zeit", "Tuna Pasta Salad", "360 g."),
    ]
    result = build_portion_summary(records, "Stories", ["Zaatar w Zeit"])
    zwz = next(r for r in result["rows"] if r["brand"] == "Zaatar w Zeit")
    assert zwz["consistent"] is True
    assert zwz["min_g"] == zwz["max_g"] == 360


def test_build_portion_summary_gives_a_zero_row_for_a_brand_with_no_portion_notes():
    records = [_record("Stories", "Caesar Salad", None)]
    result = build_portion_summary(records, "Stories", ["Wooden Bakery"])
    rows = {r["brand"]: r for r in result["rows"]}

    assert rows["Stories"] == {
        "brand": "Stories",
        "items_with_portion_data": 0,
        "min_g": None,
        "max_g": None,
        "consistent": False,
    }
    assert rows["Wooden Bakery"]["items_with_portion_data"] == 0


def test_build_portion_summary_ignores_a_brand_not_in_own_brand_or_competitors():
    records = [
        _record("Stories", "Caesar Salad", "380 g."),
        _record("The Koozspace", "Caesar Salad", "400 g."),
    ]
    result = build_portion_summary(records, "Stories", ["Wooden Bakery"])
    brands = [r["brand"] for r in result["rows"]]
    assert brands == ["Stories", "Wooden Bakery"]


def test_build_portion_summary_parses_decimal_gram_values():
    records = [_record("Stories", "Caesar Salad", "37.5 g.")]
    result = build_portion_summary(records, "Stories", [])
    stories = next(r for r in result["rows"] if r["brand"] == "Stories")
    assert stories["min_g"] == 37.5
