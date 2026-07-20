from pricing_pipeline.parse_pricing import is_category_header_row


def test_category_header_row_detected():
    row = ("Black Coffee", None, None, None, None, None, None, None, None, None)
    assert is_category_header_row(row) is True


def test_product_row_not_detected_as_header():
    row = ("Double Espresso Macchiato", 300000, "-", "-", "-", "-", 300000, 0, None, None)
    assert is_category_header_row(row) is False


def test_column_header_row_not_detected_as_category():
    row = ("Products Competitors", "Stories ", "Espresso Lab", "Dunkin Donuts",
           "Joe & the Juice", "Starbucks ", "Average", "Difference", None, None)
    assert is_category_header_row(row) is False


def test_empty_row_not_detected_as_category():
    row = (None,) * 10
    assert is_category_header_row(row) is False
