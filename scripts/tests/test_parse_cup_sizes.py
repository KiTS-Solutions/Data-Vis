import openpyxl
from pricing_pipeline.parse_cup_sizes import parse_cup_size_table


def _build_workbook(tmp_path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Product Competitor", "Stories", "Pinkberry", "Cremino", "Fro - U", "Average", "Difference",
               None, "OUNCES", "S", "M", "L", "TO GO ", "DINE IN"])
    ws.append(["Frozen Yogurt", None, None, None, None, None, None, None,
               "PINKBERRY", "3--5", 8, 13, 25, None])
    ws.append(["Original Yogurt SMALL", 500000, 450000, None, "-", 475000, 25000, None,
               "FRO-U", 3.5, 5.3, 10, 20, 4.3])
    ws.append([None, None, None, None, None, None, None, None, "CREMINO", 5.75, "-", 8.25, None, None])
    ws.append([None, None, None, None, None, None, None, None, "STORIES", 12, 16, 20, None, None])
    path = tmp_path / "fy.xlsx"
    wb.save(path)
    return str(path)


def _config():
    return {
        "client": "Stories",
        "cup_size_brand_aliases": {
            "PINKBERRY": "Pinkberry", "FRO-U": "Fro - U", "CREMINO": "Cremino", "STORIES": "Stories",
        },
    }


def test_parse_cup_size_table_reads_all_four_brands(tmp_path):
    result = parse_cup_size_table(_build_workbook(tmp_path), _config())
    brands = [r["brand"] for r in result["rows"]]
    assert brands == ["Pinkberry", "Fro - U", "Cremino", "Stories"]


def test_parse_cup_size_table_normalizes_double_dash_range(tmp_path):
    result = parse_cup_size_table(_build_workbook(tmp_path), _config())
    pinkberry = next(r for r in result["rows"] if r["brand"] == "Pinkberry")
    assert pinkberry["S"] == "3-5"


def test_parse_cup_size_table_treats_dash_as_missing(tmp_path):
    result = parse_cup_size_table(_build_workbook(tmp_path), _config())
    cremino = next(r for r in result["rows"] if r["brand"] == "Cremino")
    assert cremino["M"] is None


def test_parse_cup_size_table_preserves_numeric_values(tmp_path):
    result = parse_cup_size_table(_build_workbook(tmp_path), _config())
    stories = next(r for r in result["rows"] if r["brand"] == "Stories")
    assert stories == {"brand": "Stories", "S": 12, "M": 16, "L": 20, "TO_GO": None, "DINE_IN": None}
