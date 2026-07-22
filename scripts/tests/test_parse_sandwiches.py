import openpyxl
from pricing_pipeline.parse_sandwiches import parse_sandwich_workbook


def _build_workbook(tmp_path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Price Comparison"
    ws.append(["SANDWICH PRICE COMPARISON REPORT"])
    ws.append(["Date: 20 July 2026 | Currency: Lebanese Pound (LBP)"])
    ws.append([None])
    ws.append(["Item", "Bread Type", "Pain d'Or (LBP)", "Fakhani (LBP)", "Stories (LBP)",
               "Wooden Bakery (LBP)", "Min Price", "Max Price", "Average Price", "Lowest Bakery"])
    ws.append(["Turkey & Cheese", "White", 712000, 480000, 650000, 605000, None, None, None, None])
    ws.append(["Halloum", "White", 534000, 250000, 550000, 470000, None, None, None, None])
    ws.append(["Average Price", "All Sandwich Types", None, None, None, None, None, None, None, "Fakhani"])
    wb.create_sheet("Bakery Insights")
    path = tmp_path / "sandwiches.xlsx"
    wb.save(path)
    return str(path)


def _config():
    return {
        "client": "Stories",
        "report_date": "2026-07-20",
        "currency": "LBP",
        "fx_usd_rate": 89600,
        "fx_rate_date": "2026-07-20",
        "fx_source": "test",
        "own_brand": "Stories",
        "competitors": ["Pain d'Or", "Fakhani", "Wooden Bakery"],
        "category": "Sandwiches",
    }


def test_parse_sandwich_workbook_combines_item_and_bread_type(tmp_path):
    xlsx_path = _build_workbook(tmp_path)
    result = parse_sandwich_workbook(xlsx_path, _config())

    turkey = [r for r in result["records"] if r["product"] == "Turkey & Cheese (White)"]
    assert len(turkey) == 4
    assert {r["brand"] for r in turkey} == {"Stories", "Pain d'Or", "Fakhani", "Wooden Bakery"}
    stories_price = [r for r in turkey if r["brand"] == "Stories"][0]
    assert stories_price["price_lbp"] == 650000
    assert stories_price["category"] == "Sandwiches"


def test_parse_sandwich_workbook_skips_summary_row(tmp_path):
    xlsx_path = _build_workbook(tmp_path)
    result = parse_sandwich_workbook(xlsx_path, _config())
    assert all(r["product"] != "Average Price" for r in result["records"])


def test_parse_sandwich_workbook_config_mismatch_raises_error(tmp_path):
    xlsx_path = _build_workbook(tmp_path)
    config = _config()
    config["competitors"] = ["Pain d'Or", "Fakhani", "Unknown Bakery"]
    try:
        parse_sandwich_workbook(xlsx_path, config)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Unknown Bakery" in str(e)
