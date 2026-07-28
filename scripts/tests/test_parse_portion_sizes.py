import openpyxl
from pricing_pipeline.parse_portion_sizes import parse_portion_size_table


def _build_workbook(tmp_path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Products Competitors", "Stories", "Wooden Bakery (200g.)", "Zaatar w Zeit (200g.)",
               "Casper & Gambini", "The Koozspace", "Average", "Difference",
               "PORTION SIZE (g)", "PRICED PORTION (G)", "ALSO AVAILABLE (G)"])
    ws.append(["SALADS", None, None, None, None, None, None, None,
               "Stories", "-", "-"])
    ws.append(["SALAD BAR 1 VISIT", 1200000, "-", "-", "-", "-", 1200000, 0,
               "Wooden Bakery", 200, "-"])
    ws.append(["ASIAN SALAD (GRAB&GO)", 750000, "-", "-", "-", "-", 750000, 0,
               "Zaatar w Zeit", 200, 400])
    ws.append([None, None, None, None, None, None, None, None,
               "Casper & Gambini", 400, "-"])
    ws.append([None, None, None, None, None, None, None, None,
               "The Koozspace", 400, "-"])
    path = tmp_path / "salads.xlsx"
    wb.save(path)
    return str(path)


def _config():
    return {"client": "Stories"}


def test_parse_portion_size_table_reads_all_five_brands(tmp_path):
    result = parse_portion_size_table(_build_workbook(tmp_path), _config())
    brands = [r["brand"] for r in result["rows"]]
    assert brands == ["Stories", "Wooden Bakery", "Zaatar w Zeit", "Casper & Gambini", "The Koozspace"]


def test_parse_portion_size_table_treats_dash_as_missing(tmp_path):
    result = parse_portion_size_table(_build_workbook(tmp_path), _config())
    stories = next(r for r in result["rows"] if r["brand"] == "Stories")
    assert stories == {"brand": "Stories", "PRICED_G": None, "ALSO_AVAILABLE_G": None}


def test_parse_portion_size_table_flags_wooden_bakery_as_200g_only(tmp_path):
    result = parse_portion_size_table(_build_workbook(tmp_path), _config())
    wb = next(r for r in result["rows"] if r["brand"] == "Wooden Bakery")
    assert wb == {"brand": "Wooden Bakery", "PRICED_G": 200, "ALSO_AVAILABLE_G": None}


def test_parse_portion_size_table_flags_zaatar_w_zeit_dual_size(tmp_path):
    result = parse_portion_size_table(_build_workbook(tmp_path), _config())
    zwz = next(r for r in result["rows"] if r["brand"] == "Zaatar w Zeit")
    assert zwz == {"brand": "Zaatar w Zeit", "PRICED_G": 200, "ALSO_AVAILABLE_G": 400}


def test_parse_portion_size_table_locates_header_wherever_main_table_ends(tmp_path):
    """The side-table's column position is derived from the main table's
    width, which grows whenever a competitor or note column is added (as
    happened when "Pain D'or" was added to the real Salads sheet) — the
    parser must locate the "PORTION SIZE (g)" header dynamically rather
    than assuming a fixed column range."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Products Competitors", None, "Stories", None, "Wooden Bakery", None, "Zaatar w Zeit",
               None, "Casper & Gambini", None, "Pain D'or", "The Koozspace", "Average", "Difference",
               "PORTION SIZE (g)", "PRICED PORTION (G)", "ALSO AVAILABLE (G)"])
    ws.append(["SALADS", None, None, None, None, None, None, None, None, None, None, None, None, None,
               "Stories", "-", "-"])
    ws.append(["ASIAN SALAD", "380 g.", 750000, "-", "-", None, "-", None, 851200, None, None, "-",
               800600, -50600, "Wooden Bakery", 200, "-"])
    ws.append(["TUNA PASTA SALAD", "440 g.", 850000, "550 g.", 716800, "200 g.", 806400, None, "-",
               "500-600g.", 1074000, 1075200, 904480, -54480, "paind'or", "500-600", None])
    path = tmp_path / "salads_shifted.xlsx"
    wb.save(path)

    result = parse_portion_size_table(str(path), _config())

    pain_dor = next(r for r in result["rows"] if r["brand"] == "paind'or")
    assert pain_dor == {"brand": "paind'or", "PRICED_G": "500-600", "ALSO_AVAILABLE_G": None}


def test_parse_portion_size_table_excludes_dropped_brands(tmp_path):
    config = _config()
    config["dropped_brands"] = ["The Koozspace"]

    result = parse_portion_size_table(_build_workbook(tmp_path), config)

    brands = [r["brand"] for r in result["rows"]]
    assert brands == ["Stories", "Wooden Bakery", "Zaatar w Zeit", "Casper & Gambini"]


def test_parse_portion_size_table_applies_brand_aliases(tmp_path):
    config = _config()
    config["portion_size_brand_aliases"] = {"Wooden Bakery": "WB Alias"}
    result = parse_portion_size_table(_build_workbook(tmp_path), config)
    brands = [r["brand"] for r in result["rows"]]
    assert "WB Alias" in brands
